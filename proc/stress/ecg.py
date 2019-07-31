'''
This module was created 2019-08-31 to look at the initial ECG data collected
for the CIMVHR study.

    Using machine learning to investigate sympathetic activation of the
    autonomic nervous system (SAANS) during the treatment of mild traumatic
    brain injury, chronic pain, and post-traumatic stress disorder.

This loads ECG data and processes it using the modified Pan-Tompkins QRS
detector in stress/panTompkins.py. Sample python code is available in the
Jupyter Notebook `HRV.ipyb`.

The functions read_ecg, plot_ecg load a file and plot a segment of the ECG
signal.

The function ecg_to_qrs uses a modified Pan-Tompkins code.

There are many Pan-Tompkins[1] implementations. The filtering process is
simple, but the devil is in the details: the adaptive thresholds, where each
implementation makes different choices. For many data sets where the ECG is
relatively clean, these choices don't seem to make much difference, but for our
data many implementations produce quite poor results. We base our
implementation off an MIT licensed (open source, no restrictions) python code
from github.com/pickus91/HRV.

The original Pan-Tompkins QRS detector (including this python implementation)
find very few beats and most of those are noise. Initialization fails because
the start of the recording is noisy (lots of movement as the instrument is
turned on, attached to the patient, and the patient moves into the virtual
reality simulator). Even with a good initialization, noise due to movement will
often drive the Pan-Tompkins thresholds into a region where it will never
detect another QRS complex.

By allowing the thresholds to decay after 10x the expected max R-R interval, at
a rate set by decay per detected signal peak, we can now recover when these
detection thresholds are either initialized to a large value or are driven to a
large value due to random noise (for example, movement artifacts).


Using the R peaks detected by the modified Pan-Tompkins, we can calculate R-R
intervals (heart rate, HR) in beats per minute (bpm), and the heart rate
variability (HRV) in beats per minute.

For HRV, there are many alternatives to Root Mean Square of Successive
Differences (RMSSD). See wikipedia/Heart_rate_variability for some examples.

Finally, we can plot signal quality index (SQI) from [2] to get an estimate of
SNR in dB.

[1] Jiapu Pan, Willis J. Tompkins. "A real-time QRS detection algorithm." IEEE
    Transactions on Biomedical Engineering 3 (1985): 230-236.

[2] M. Abdelazez, P. Quesnel, A. D. C. Chan, H. Yang. Signal Quality Analysis
    of Ambulatory Electrocardiograms to Gate False Myocardial Ischemia Alarms.
    IEEE Transactions on Biomedical Engineering 64(6) 1318-1325, 2017.
    10.1109/TBME.2016.2602283

'''

import numpy as np
from matplotlib import pyplot as plt

from .pan_tompkins import pan_tompkins


def read_ecg(filename):
    ecg = np.genfromtxt(filename, delimiter=',')
    ecg = ecg[1:, 1]
    fs = int(1/5e-3)  # TODO learn this from the file!
    return ecg, fs


def ecg_to_qrs(ecg, fs=200, decay=0.999):
    qrs = pan_tompkins(ecg, fs=fs, decay=decay)
    return qrs


def plot_ecg(ecg, qrs=None, offset=None, window=None, fs=200):
    if offset is None:
        offset = len(ecg)/fs/2
    if window is None:
        window = len(ecg)/fs
    ax = plt.gca()
    ax.set_xlabel("time (s)")
    ax.set_ylabel("ECG")
    if qrs is not None:
        t_qrs = [i/fs for i in qrs]
        ax.scatter(t_qrs, ecg[qrs], color='r')
    t = [i/fs for i in range(len(ecg))]
    ax.plot(t, ecg, color='b')
    ax.set_xlim(offset-window/2, offset+window/2)
    sel = np.arange(int((offset-window/2)*fs), int((offset+window/2)*fs))
    ax.set_ylim(min(ecg[sel]), max(ecg[sel]))


def calc_hr_bpm(qrs, fs=200):
    t_qrs = [i/fs for i in qrs]
    eps = np.finfo(float).eps
    bpm = 60/(np.diff(t_qrs) + eps)  # heart rate in beats per minute
    return t_qrs, bpm


def plot_hr_bpm(t_qrs, bpm, hrv=None, offset=None, window=None, fs=200):
    if offset is None:
        offset = t_qrs[-1]/2
    if window is None:
        window = t_qrs[-1]
    ax = plt.gca()
    ax.set_xlabel("time (s)")
    ax.set_ylabel("R-R (bpm)", color='g')
    ax.tick_params(axis='y', labelcolor='g')
    x = np.asarray(t_qrs[1:])
    ax.plot(x, bpm, color='g', linestyle='dashed', marker='.')
    ax.set_xlim(offset-window/2, offset+window/2)
    # sel = np.where(abs(x-offset) < window/2)
    # ax.set_ylim(min(bpm[sel])*0.9,max(bpm[sel])*1.1)
    ax.set_ylim(0, 240)
    if len(hrv) != 0:
        ax2 = ax.twinx()
        ax2.set_ylabel("HRV RMSSD (bpm)", color='r')
        ax2.tick_params(axis='y', labelcolor='r')
        delta = len(t_qrs)-len(hrv)
        # we centre the RMSSD since we're calculating after the fact
        x = np.asarray(t_qrs[int(delta/2):-(delta-int(delta/2))])
        ax2.plot(x, hrv, color='r', linestyle='dashed', marker='.')
        # plt.xlim(offset_t-window_t/2,offset_t+window_t/2)
        # plt.ylim(min(hrv[sel]),max(hrv[sel]))
        ax2.set_ylim(0, 10)


# RMSSD: Root Mean Square of Successive Differences between each heartbeat
def moving_rmssd(x, window=np.hanning(16)):
    y = np.convolve(window/window.sum(), np.diff(x)**2, mode='valid')
    return np.sqrt(y)


def calc_hrv_bpm(bpm):
    return moving_rmssd(bpm, window=np.hanning(32))


def calc_hr_sqi(ecg, qrs, window=30, fs=200):
    ecg = np.pad(ecg, fs, mode='constant')  # add fs samples of zero padding
    eps = np.finfo(float).eps
    t_qrs = [i/fs for i in qrs]
    rr_samples = np.diff(qrs)
    # find workable 30 second windows
    windows = list()
    for i, r in enumerate(qrs):
        j_start = np.where(t_qrs > t_qrs[i] - window/2)[0]
        j_end = np.where(t_qrs > t_qrs[i] + window/2)[0]
        if len(j_start) < 1:
            j_start = 0
        else:
            j_start = j_start[0]
        if len(j_end) < 1:
            j_end = len(t_qrs)-1
        else:
            j_end = j_end[0]
        min_rr = np.min(rr_samples[j_start:j_end+1])
        rr2 = int(np.floor(min_rr/2))
        # if we would overrun the end of the ECG signal
        if qrs[j_end]+rr2 >= len(ecg):
            j_end -= 1
        # if we would underrun the start of the ECG signal
        if qrs[j_start]-rr2 < 0:
            j_start += 1
        windows.append((j_start, j_end))
    # merge the QRS and calculate SNR from the averaged beats in each window
    snr = np.full(len(qrs), np.nan)
    for i, r in enumerate(qrs):
        j_start, j_end = windows[i]
        # calculate [2] eqn (1); W_avg
        seg = int(fs*0.7/2)  # segment 0.7 sec of samples centred on R peak
        av_qrs = np.zeros(seg*2)
        for j in range(j_start, j_end+1):
            av_qrs += ecg[qrs[j]-seg+fs:qrs[j]+seg+fs]  # +fs is for padding
        M = j_end - j_start + 1  # number of QRS in W_avg = av_qrs
        av_qrs = av_qrs / M
        # calculate [2] eqn (2); SNR
        this_qrs = ecg[qrs[i]-seg+fs:qrs[i]+seg+fs]  # +fs is for padding
        snr[i] = np.sum(av_qrs**2)
        snr[i] /= np.sum((av_qrs - this_qrs)**2) + eps
    snr = 10 * np.log10(snr + eps)  # convert to dB
    # now poor SNR in each window
    sqi = np.zeros(len(snr))
    for i in range(len(snr)):
        # calculate [2] 25th percentile of all SNR in 30s window
        j_start, j_end = windows[i]
        wlen = j_end - j_start + 1  # window length
        q25 = int(np.floor(wlen*0.25))
        sqi[i] = np.sort(snr[j_start:j_end+1])[q25]
    return sqi


def plot_hr_sqi(t_qrs, sqi, offset=None, window=None, threshold=None):
    if offset is None:
        offset = t_qrs[-1]/2
    if window is None:
        window = t_qrs[-1]
    ax = plt.gca()
    if threshold is None:
        ax.plot(t_qrs, sqi, 'g')
    else:
        ax.plot(t_qrs, sqi, 'g')
        ax.plot(t_qrs, np.where(sqi < threshold, sqi, np.nan), 'r')
        ax.set_ylabel('SQI')
        ax.set_xlabel('time (s)')
        ax.set_xlim(offset-window/2, offset+window/2)
        sel = np.where(np.abs(np.array(t_qrs)-offset) < window/2)
        ax.set_ylim(min(sqi[sel])*0.9, max(sqi[sel])*1.1)
