
# coding: utf-8

# CIMVHR Forum 2019 Poster Plots
# -----------------------------------
#
# This notebook was created 2019-09-30 to make plots for the CIMVHR Forum 2019 poster "Machine Learning for the Prediction of Autonomic Nervous System Response during Virtual Reality Treatment using Biometric Data"

# ECG to HRV
# =====

# In[1]:


import stress
import stress.pan_tompkins
import math
import numpy as np
from matplotlib import pyplot as plt

fn = 'ECG/2018_12_05-10_35_00_ECG.csv.gz'
ecg, fs = stress.read_ecg(fn)
sec = len(ecg)/fs
print('ECG %s: %d samples at %d Hz (%02d:%02d:%02d)' %
      (fn, len(ecg), fs, math.floor(sec/60/60), math.fmod(math.floor(sec/60), 60), math.fmod(sec, 60) ))

offset = 3050 # seconds
window = 240 # seconds

qrs, data = stress.pan_tompkins.pan_tompkins(ecg, fs, decay = 0.99)
sqi = stress.calc_hr_sqi(ecg, qrs)

t_qrs, bpm = stress.calc_hr_bpm(qrs) # heart rate in beats per minute (bpm), and associated times for each change in bpm
hrv = stress.calc_hrv_bpm(bpm)  # heart rate variability in beats per minute
print('%d QRS complexes found'%(len(qrs)))


# In[55]:


plt.clf()
ax = plt.subplot(311)
stress.plot_ecg(ecg, qrs, offset=offset, window=window)
#plt.title(fn)
ax.set_xlabel('')
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['bottom'].set_visible(False)
ax.spines['left'].set_visible(False)
ax.set_xticks([])
plt.title('ECG to Heart Rate Variability and Signal Quality Index')

ax = plt.subplot(312)
axL = stress.plot_hr_bpm(t_qrs, bpm, hrv, window=window, offset=offset)
ax.set_xlabel('')
for ax in axL:
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['bottom'].set_visible(False)
    ax.spines['left'].set_visible(False)
    ax.set_xticks([])


ax = plt.subplot(313)
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['bottom'].set_visible(False)
ax.spines['left'].set_visible(False)
stress.plot_hr_sqi(t_qrs, sqi, offset=offset, window=window)


fig = plt.gcf()
fig.set_size_inches(18, 8)
plt.savefig('ecg.pdf', transparent=True,
            bbox_inches='tight', pad_inches=0)
plt.show()


# The original Pan-Tompkins algorithm is
#
# >  [1] Jiapu Pan, Willis J. Tompkins. "A real-time QRS detection algorithm."
# >  IEEE Transactions onBiomedical Engineering 3 (1985): 230-236.
#
# There are many implementations. The filtering process is simple, but the devil is in the details: the adaptive thresholds, where each implementation makes different choices. For many data sets where the ECG is relatively clean, these choices don't seem to make much difference, but for our data many implementations produce quite poor results. We base our implementation off an [MIT licensed](https://opensource.org/licenses/MIT) (open source, no restrictions) python code from [github.com/pickus91/HRV](https://github.com/pickus91/HRV).
#
# The original Pan-Tompkins QRS detector (including this python implementation) find very few beats and most of those are noise.
# Initialization fails because the start of the recording is noisy
# (lots of movement as the instrument is turned on, attached to the patient,
#  and the patient moves into the virtual reality simulator).
# Even with a good initialization, noise due to movement will often drive the Pan-Tompkins
# thresholds into a region where it will never detect another QRS complex.
#
# Note the option `decay = None`, disabling new code.

# By allowing the thresholds to decay after 10x the expected max R-R interval,
# at a rate set by `decay` per detected signal peak,
# we can now recover when these detection thresholds are either initialized
# to a large value or are driven to a large value due to random noise (for example, movement artifacts).
#
# Note the option `decay != None`.
#
# We now detect many beats for most available ECG recordings and the R peaks are quite accurate, even for moderately noisy data.

# Using the R peaks detected by the modified Pan-Tompkins, we can calculate R-R intervals (heart rate, HR)
# in beats per minute (bpm), and the heart rate variability (HRV) in beats per minute.
#
# For HRV, there are many alternatives to Root Mean Square of Successive Differences (RMSSD). See [wikipedia/Heart_rate_variability](https://en.wikipedia.org/wiki/Heart_rate_variability) for some examples.

# And plot signal quality index (SQI) from
#
# >  [2] M. Abdelazez, P. Quesnel, A. D. C. Chan, H. Yang. Signal Quality Analysis of Ambulatory Electrocardiograms to Gate False Myocardial Ischemia Alarms.
# > IEEE Transactions on Biomedical Engineering 64(6) 1318-1325, 2017. [10.1109/TBME.2016.2602283](https://doi.org/10.1109/TBME.2016.2602283)
#

# In[26]:


fn = 'C3D/20190617_1300_BREAK_OUT_TR01.c3d'
labels, markerset, (fs_point, fs_force), frames = stress.read_c3d(fn)
points, analog = stress.extract_frames(fn)
analog_filt, fs = stress.filter_force_plates(analog, fc=10,
                                             fs_force=fs_force,
                                             fs_point=fs_point)
avg = stress.combine_force_plates(analog_filt)  # combine force plates by summing forces and moments

cop = np.array([*stress.calc_cop(avg),
                 stress.calc_vec(avg)[0]]).transpose()
force = np.array([stress.calc_vec(analog_filt[:,0:3])[0],
                  stress.calc_vec(analog_filt[:,6:9])[0]]).transpose()

skel = stress.load_markerset(markerset)
frame_num = int(203*fs)

missing, cause = stress.check_c3d_markers(skel, labels)
dropped = stress.find_dropped_markers(points, labels,
                                      frame_num=frame_num)
skel_idx = stress.skel_to_ids(skel, labels,
                              dropped_or_missing=set(dropped | missing))

print(fn)
print('markerset: ' + markerset)
for a in missing:
    print('%6s <missing from %s>' % (a, cause[a]))
for a in dropped:
    print('%6s <dropped marker>' % (a))


# In[52]:


plt.clf()
ax = plt.subplot(projection='3d')
ax.view_init(20, -50)
stress.plot_skel(skel_idx, points, frame_num=frame_num,
                 labels=None, node_size=24)
ax.w_xaxis.set_pane_color((1.0, 1.0, 1.0, 1.0))
ax.w_yaxis.set_pane_color((1.0, 1.0, 1.0, 1.0))
ax.grid(False)
plt.title('Marker Motion Capture', y=+0.85)

fig = plt.gcf()
fig.set_size_inches(8,8)
plt.savefig('c3d.pdf', transparent=True,
            bbox_inches='tight', pad_inches=0)
plt.show()


# In[35]:


plt.clf()
plt.tight_layout()

ax = plt.subplot2grid((2, 1), (0, 0), colspan=2)
stress.plot_cop(*cop.transpose(), frame_num=frame_num, markersize=12)
ax.set_title('Centre of Pressure')
ax.set_xlabel('x (mm)')
ax.set_ylabel('y (mm)')


ax = plt.subplot2grid((2, 1), (1, 0), colspan=3)
stress.plot_force_plates(force, frame_num=frame_num, fs=fs)
ax.legend(loc='upper left', ncol=3, frameon=False)

fig = plt.gcf()
fig.set_size_inches(18, 8)
plt.savefig('force.pdf', transparent=True,
            bbox_inches='tight', pad_inches=0)
plt.show()

