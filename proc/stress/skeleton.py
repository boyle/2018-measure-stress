import numpy as np
from matplotlib import pyplot as plt

def load_markerset(name):
    if name == '0_MPL_FULL_BODY_57markers_V2':
        return load_markerset_0_MPL_FULL_BODY_57markers_V2()
    else:
        raise Exception('%s: unrecognized marker set' % (name))


def load_markerset_0_MPL_FULL_BODY_57markers_V2():
    return (
        # HEAD
        ('LFHD', 'RFHD'),
        ('RFHD', 'RBHD'),
        ('LFHD', 'LBHD'),
        ('LBHD', 'RBHD'),
        ('C7', 'RBHD'),
        # THORAX
        ('C7', 'STRN'),
        ('STRN', 'XYPH'),
        ('XYPH', 'T8'),
        ('T8', 'C7'),
        ('T8', 'LSHO'),
        ('T8', 'RSHO'),
        ('C7', 'LSHO'),
        ('C7', 'RSHO'),

        # LUAn
        ('LUA2', 'LSHO'),
        ('LUA1', 'LUA2'),
        ('LUA2', 'LUA3'),
        ('LUA3', 'LUA1'),
        ('LFAL', 'LUA2'),
        ('LFIN', 'LWRR'),
        ('LWRR', 'LWRU'),
        ('LWRR', 'LFAL'),
        ('LFAL', 'LFAM'),
        # RUAn
        ('RUA2', 'RSHO'),
        ('RUA1', 'RUA2'),
        ('RUA2', 'RUA3'),
        ('RUA3', 'RUA1'),
        ('RFAL', 'RUA2'),
        ('RFIN', 'RWRR'),
        ('RWRR', 'RWRU'),
        ('RWRR', 'RFAL'),
        ('RFAL', 'RFAM'),

        # back
        ('T8', 'RBAC'),
        ('C7', 'RBAC'),
        ('T8', 'LPSI'),
        ('T8', 'RPSI'),
        ('RPSI', 'LPSI'),
        ('LPSI', 'LASI_2'),
        ('RPSI', 'RASI_2'),
        ('RASI_2', 'RASI'),
        ('LASI_2', 'LASI'),

        # LTHn
        ('LTH4', 'LASI_2'),
        ('LTH1', 'LTH3'),
        ('LTH3', 'LTH2'),
        ('LTH2', 'LTH4'),
        ('LTH4', 'LTH1'),
        # RTHn
        ('RTH4', 'RASI_2'),
        ('RTH1', 'RTH2'),
        ('RTH2', 'RTH4'),
        ('RTH4', 'RTH3'),
        ('RTH3', 'RTH1'),

        # LSKn
        ('LSK4', 'LTH4'),
        ('LSK1', 'LSK2'),
        ('LSK2', 'LSK3'),
        ('LSK3', 'LSK4'),
        ('LSK4', 'LSK1'),
        # RSKn
        ('RSK4', 'RTH4'),
        ('RSK1', 'RSK2'),
        ('RSK2', 'RSK3'),
        ('RSK3', 'RSK4'),
        ('RSK4', 'RSK1'),
        # right foot
        ('RHEE', 'RSK4'),
        ('RTOE', 'RHEE'),
        ('RHEE', 'RLHL'),
        ('RLHL', 'R5MT'),
        ('R5MT', 'RTOE'),
        # left foot
        ('LHEE', 'LSK4'),
        ('LTOE', 'LHEE'),
        ('LHEE', 'LLHL'),
        ('LLHL', 'L5MT'),
        ('L5MT', 'LTOE'),
    )


def check_c3d_markers(skel, c3d_labels):
    lookup = { k: v for v, k in enumerate(c3d_labels) }
    # sorted_labels = sorted(c3d_labels)
    # print('All labels:')
    # for i in [i for i in range(int(np.ceil(len(sorted_labels)/10)))]:
    #    print(''.join(['[%2d] %-6s'%(lookup[s], s) for s in sorted_labels[i*10:i*10+10]]))
    seen = set()
    missing = set()
    cause = dict()
    for a, b in skel:
        if not lookup.get(a, None):
            missing.add(a)
            cause[a] = 'c3d'
        if not lookup.get(b, None):
            missing.add(b)
            cause[b] = 'c3d'
        seen.add(a)
        seen.add(b)

    for a in c3d_labels:
        if a not in seen:
            missing.add(a)
            cause[a] = 'skeleton'

    return missing, cause
    # for a in missing:
    #     print('%6s <missing from %s>'%(a, cause[a]))


def find_dropped_markers(points, c3d_labels, frame_num=0):
    dropped = set()
    for i, label in enumerate(c3d_labels):
        if points[frame_num, i, 3] < 0:
            dropped.add(label)
    return dropped
    # for a in dropped:
    #     print('%6s <dropped marker>' % (a))


def skel_to_ids(skel, c3d_labels, dropped_or_missing=set()):
    lookup = { k: v for v, k in enumerate(c3d_labels) }
    skel_list = list()
    for a, b in skel:
        if a not in dropped_or_missing and b not in dropped_or_missing:
            skel_list.append((lookup[a], lookup[b]))
        # print('%6s (%2d) <--> (%2d) %-6s' %(a, lookup[a], lookup[b], b))
    return np.asarray(skel_list)


def plot_skel(skel_idx, points, frame_num=0, labels=None, node_size=2):
    frame_num = int(frame_num)
    ax = plt.gca()
    ax.set(frame_on=False)
    ax.set_xlabel('x')
    ax.set_ylabel('y')
    xyz0 = np.mean(points, axis=1)
    if  ax.name == "3d":
        points = points[frame_num,:,0:3]
        ax.set_zlabel('z')
        lims = np.ptp(points, axis=0).max() / 2.0
        mids = np.min(points, axis=0) + lims
        ax.set_xlim(mids[0] - lims*1.1, mids[0] + lims*1.1)
        ax.set_ylim(mids[1] - lims*1.1, mids[1] + lims*1.1)
        ax.set_zlim(mids[2] - lims*1.1, mids[2] + lims*1.1)
    else:
        points = points[frame_num,:,1:3]
        ax.axis('equal')
    uniq_idx = np.unique(skel_idx)
    lines = points[skel_idx, :].transpose()
    nodes = points[uniq_idx, :].transpose()
    #print(lines)
    #print(np.shape(lines))
    for line in lines.transpose():
       ax.plot(*line.transpose(), color='b', zorder=1)
    ax.scatter(*nodes, color='r', zorder=2, s=node_size)
    # ax.scatter(*points.transpose(), color='g', zorder=0, s=node_size*2)
    if labels:
        for i, idx in enumerate(uniq_idx):
            ax.text(*nodes[:,i], labels[idx], fontsize=8, zorder=10)
