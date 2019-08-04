import numpy as np
from scipy import signal
from matplotlib import pyplot as plt
from matplotlib.collections import LineCollection
from mpl_toolkits.mplot3d import Axes3D
import c3d


def read_c3d(filename, print_metadata=False):
    fs_point = 0.0
    fs_force = 0.0
    frames = 0
    labels = None
    with open(filename, 'rb') as handle:
        reader = c3d.Reader(handle)
        fs_force = reader.analog_rate
        fs_point = reader.point_rate
        frames = reader.header.last_frame - reader.header.first_frame
        sec = frames/fs_point
        labels = c3d_read_labels(reader)
        markerset = reader.groups[2].params['MARKER_SETS'].string_array[0].strip()
        print('%d frames in %0.1f sec (%02d:%02d:%04.1f) at %d Hz; analog data sampled at %d Hz\n\n' %
              (frames, sec, np.floor(sec/60/60), np.mod(np.floor(sec/60), 60), np.mod(sec, 60), fs_point, fs_force))
        if print_metadata:
            c3d_print_metadata(reader)

    return labels, markerset, (fs_point, fs_force), frames


def print_frames(filename, n=np.inf):
    with open(filename, 'rb') as handle:
        reader = c3d.Reader(handle)
        for frame_num, points, analog in reader.read_frames(copy=False):
            print('  [n] %s x %s y %s z %s err cam'%(' '*(6), ' '*8, ' '*8, ' '*3))
            for i, (x, y, z, err, cam) in enumerate(points):
                if err > 0:
                    print('[%d.%02dP] %10.4f %10.4f %10.4f %0.1f %3s' % (frame_num, i, x, y, z, err, hex(int(cam))))
                elif err == 0:
                    print('[%d.%02dP] %10.4f %10.4f %10.4f     %3s' % (frame_num, i, x, y, z, hex(int(cam))))
                else:
                    print('[%d.%02dP] <invalid>' % (frame_num, i))
            print(('  [n]' + '%10s'*12) % ('x1', 'y1', 'z1', 'X1', 'Y1', 'Z1',
                                           'x2', 'y2', 'z2', 'X2', 'Y2', 'Z2'))
            for i, data in enumerate(analog.transpose()):
                print('[%d.%02dA]'%(frame_num, i) + ''.join(' %9.2e'%(k) for k in data))
            avg = np.mean(analog,axis=1)
            print('[%d.%2sA]'%(frame_num, '~~') + ''.join(' %9.2e'%(k) for k in avg))
            x1, y1 = calc_cop(avg[0:3], avg[3:6])
            fm1, xd1, yd1 = calc_vec(avg[0:3])
            print('COP1 (%+0.2f, %+0.2f) mm, %0.2f N (%+5.1f°, %+5.1f°) = %0.1f kg (%0.1f lbs)' %
                  (x1, y1, fm1, xd1, yd1, f_kg(fm1), f_lbs(fm1)))
            x2, y2 = calc_cop(avg[6:9], avg[9:12])
            fm2, xd2, yd2 = calc_vec(avg[6:9])
            print('COP2 (%+0.2f, %+0.2f) mm, %0.2f N (%+5.1f°, %+5.1f°) = %0.1f kg (%0.1f lbs)' %
                  (x2, y2, fm2, xd2, yd2, f_kg(fm2), f_lbs(fm2)))
            # combined both force plates to get an overall COP
            x, y = calc_cop(avg[0:3]+avg[6:9], avg[3:6]+avg[9:12])
            fm, xd, yd = calc_vec(avg[0:3]+avg[6:9])
            print('COP (%+0.2f, %+0.2f) mm, %0.2f N (%+5.1f°, %+5.1f°) = %0.1f kg (%0.1f lbs)' %
                  (x, y, fm, xd, yd, f_kg(fm), f_lbs(fm)))
            if frame_num >= n:
                break  # show first frame only


def extract_frames(filename):
    total_points = list()
    total_analog = list()
    len_points = None
    rows_analog = None
    cols_analog = None
    with open(filename, 'rb') as handle:
        reader = c3d.Reader(handle)
        for frame_num, points, analog in reader.read_frames(copy=True):
            total_points.append(points)
            [total_analog.append(i) for i in analog.transpose()]

            # if len_points:
            #     assert(len_points == len(points),
            #            'number of points (markers) in a frame changed')
            # else:
            #     len_points = len(points)
            #
            # if rows_analog:
            #     assert(rows_analog == len(analog),
            #            'number of analog (forceplates) in a frame changed')
            # else:
            #     rows_analog = len(analog)
            #
            # if cols_analog:
            #     assert(cols_analog == len(analog[0]),
            #            'number of analog samples (forceplate measurements) in a frame changed')
            # else:
            #     cols_analog = len(analog[0])
        # assert(reader.analog_rate/reader.point_rate == cols_analog,
        #        'relative points vs. analog sample rate does not match data')
    return np.asarray(total_points), np.asarray(total_analog)


def c3d_print_metadata(reader):
    print('Header information:\n{}'.format(reader.header))
    groups = ((k, v) for k, v in reader.groups.items() if isinstance(k, str))
    for key, g in sorted(groups):
        if not isinstance(key, int):
            print('')
            for key, p in sorted(g.params.items()):
                c3d_print_param(g, p)

# from c3d-metadata
def c3d_print_param(g, p):
    print('{0.name}.{1.name}: {1.total_bytes}B {1.dimensions}'.format(g, p))
    if len(p.dimensions) == 0:
        val = None
        width = len(p.bytes)
        if width == 2:
            val = p.int16_value
        elif width == 4:
            val = p.float_value
        else:
            val = p.int8_value
        print('{0.name}.{1.name} = {2}'.format(g, p, val))
    if len(p.dimensions) == 1 and p.dimensions[0] > 0:
        arr = []
        width = p.total_bytes // p.dimensions[0]
        if width == 2:
            arr = p.int16_array
        elif width == 4:
            arr = p.float_array
        else:
            arr = p.int8_array
        for r, v in enumerate(arr):
            print('{0.name}.{1.name}[{2}] = {3}'.format(g, p, r, v))
    if len(p.dimensions) == 2:
        C, R = p.dimensions
        for r in range(R):
            print('{0.name}.{1.name}[{2}] = {3}'.format(
                g, p, r, repr(p.bytes[r * C:(r+1) * C])))


def c3d_read_labels(r):
    labels = []
    p = r.groups['POINT'].params['LABELS']
    C, R = p.dimensions
    for r in range(R):
        labels.append(repr(p.bytes[r * C:(r+1) * C])[2:-1].strip())
    return labels


# Center of Pressure
def calc_cop(analog):
    if analog.ndim == 1:
        analog = analog.reshape((1,-1))
    force_xyz = analog[:, 0:3]
    moment_xyz = analog[:, 3:6]
    Mx = moment_xyz[:, 0]
    My = moment_xyz[:, 1]
    Fz = force_xyz[:, 2]
    x = My/Fz
    y = Mx/Fz
    return x, y

# Magnitude of Force and angle in x and y directions
def calc_vec(force_xyz):
    if force_xyz.ndim == 1:
        force_xyz = force_xyz.reshape((1,-1))
    eps = np.finfo(float).eps
    pi = np.pi
    F = np.linalg.norm(force_xyz[:, 0:3], axis=1)
    x = np.arctan2(force_xyz[:, 0], -force_xyz[:, 2])/pi*180  # +180°
    y = np.arctan2(force_xyz[:, 1], -force_xyz[:, 2])/pi*180  # +180°
    return F, x, y


std_g = 9.80665
lbs_kg = 2.20462
f_kg = lambda fm: fm/std_g
f_lbs = lambda fm: fm/std_g * lbs_kg


def filter_force_plates(analog, fc=10, fs_force=1000, fs_point=100):
    # filter with 10 Hz low-pass filter on forces and moments, for example
    #  Mansfield and Inness. Force Plate Assessment of Quiet Standing
    #  Balance Control: Perspectives on Clinical Application Within Stroke Rehabilitation.
    #  Rehabilitation Process and Outcome 2015:4 7–15 doi:10.4137/RPO.S20363.

    # filter force plate data
    b, a = signal.butter(1, fc, fs=fs_force, btype='lowpass')
    dec = int(np.floor(fs_force/fs_point))
    print('decimating %d (%d Hz down to %d Hz) after %g Hz lowpass filter' % (dec, fs_force, fs_point, fc))
    if True:
        filt = signal.dlti(b, a)
        analog_filt = signal.decimate(analog, dec, ftype=filt, zero_phase=True, axis=0)
    else:
        analog_filt = signal.filtfilt(b, a, analog, axis=0)
        analog_filt = signal.decimate(analog_filt, dec, zero_phase=True, axis=0)
    fs = fs_point  # both points and analog are now at the same sampling frequency
    return analog_filt, fs


def combine_force_plates(analog):
    return analog[:, 0:6] + analog[:, 6:12]  # sum forces and moments


def print_cop_vec(analog, prefix=None, frame_num=0):
    x, y = calc_cop(analog[frame_num,:])
    fm, xd, yd = calc_vec(analog[frame_num,:])
    if prefix:
        prefix += ' '
    else:
        prefix = ''
    print('COP %s(%+6.2f, %+6.2f) mm, ' % (prefix, x, y) +
          '%0.2f N (%+6.1f°, %+6.1f°)+180° ' %  (fm, xd, yd) +
          '= %0.1f kg (%0.1f lbs)' % (f_kg(fm), f_lbs(fm)))


def print_force_range(fm):
    print('∥F∥ = %5.1f N   to %5.1f N' % (fm.min(), fm.max()))
    print('∥F∥ = %5.1f lbs to %5.1f lbs' % (f_lbs(fm.min()), f_lbs(fm.max())))
    print('median subject weight: %0.1f lbs' % (f_lbs(np.median(fm))))


def plot_cop(x, y, fm, frame_num=None, markersize=8):
    ax = plt.gca()
    # Create a set of line segments so that we can color them individually
    # This creates the points as a N x 1 x 2 array so that we can stack points
    # together easily to get the segments. The segments array for line collection
    # needs to be (numlines) x (points per line) x 2 (for x and y)
    points = np.array([x, y]).T.reshape(-1, 1, 2)
    segments = np.concatenate([points[:-1], points[1:]], axis=1)

    # Create a continuous norm to map from data points to colors
    norm = plt.Normalize(fm.min(), fm.max())
    lc = LineCollection(segments, cmap='viridis', norm=norm)
    # Set the values used for colormapping
    lc.set_array(fm)
    lc.set_linewidth(2)
    line = ax.add_collection(lc)
    cb = plt.colorbar(line, ax=ax)
    cb.ax.set_title('∥F∥ (N)')

    if frame_num:
        ax.plot(x[frame_num], y[frame_num], 'r.', markersize=markersize)

    # ax.plot(cop[:,0],cop[:,1])
    ax.set_xlabel('x')
    ax.set_ylabel('y')
    ax.axis('equal')


def plot_force_plates(force, frame_num=None, fs=100):
    ax = plt.gca()
    t = [i/fs for i in range(len(force))]
    ax.plot(t, force[:,0], color='r', label='left')
    ax.plot(t, force[:,1], color='b', label='right')
    ax.plot(t, np.sum(force, axis=1)/2, color='g', linestyle='dashed', label='sum/2')
    ax.legend(ncol=3, fontsize='large', frameon=False)
    ax.set_xlabel('time (s)')
    ax.set_ylabel('force (N)')
    ax.set_xlim(min(t), max(t))
    if frame_num:
        xx = [t[frame_num], t[frame_num]]
        yy = [min(force.flatten())*0.9, max(force.flatten())*1.1]
        ax.plot(xx, yy, linestyle='dotted', color='k')
        ax.text(xx[1]+max(t)*0.01, yy[1]*0.97, 't=%0.1fs'%(frame_num/fs))
