# -*- coding: utf-8 -*-
"""
modified (C) 2019 A. Boyle
 Major change from Pan-Tompkins:
 1. Allow thresholds to decay if many beats are missed, which can happen when
    periods of noise drive the thresholds too high and thereafter no peaks are
    detected so the algorithm can never recover. This code adds an optional slow
    decay after 10 x RR_MISED_IINTERVAL when input option 'decay' is set to an
    amount. Typical "good" values are 0.999 for slow exponential decay applied
    at each potential peak. Set decay = None to disable this correction, enable
    with decay = 0.999 (default).
 Major changes from original code:
 2. Use last accepted R-R intervals for RRAVERAGE1 rather than the last
    peak-to-peak time which may contain spurious noise. Disable with
    rravg = 'peaks', enable with rravg = 'qrs' input option (default).
 3. Update RR thresholds at each iteration, update RRAVERAGE2 at most once for
    each new RRAVERAGE1 update.
 Minor changes from original code:
 4. When looking for integrated waveform peak, fail cleanly if no region is
    above THRESHOLDF1 (SBdata_max_loc2)
 5. Updated to 'plot' filtered and integrated waveforms with noise and signal
    estimates.

from https://github.com/pickus91/HRV
MIT License Copyright (C) 2017 Sarah Pickus
-----------------

Created on Tue Feb 21 17:00:49 2017

@author: picku

This function implements the Pan-Tomkins ECG QRS detection algorithm
as described in:

Pan, Jiapu, and Willis J. Tompkins. "A real-time QRS detection algorithm."
IEEE transactions on biomedical engineering 3 (1985): 230-236.

The algorithm utilizes filtering, adaptive thresholding, and criteria based on
human cardiac physiology to detect QRS complexes in the face of noise and quickly
changing and diverse ECG morphologies. This function implements the Pan-Tompkins
algorithm as it was originally published, along with two modifications which
include additional filtering and eliminating potential QRS detections that occur
within the refractory period. Since this algorithm is often used to find R-peak
locations (and not just general QRS detection) for applications such as Heart
Rate Variability (HRV) analysis, this function also performs a neighborhood search
around the final QRS detection locations to find exact R-peak locations.
A summary of the algorithm is described below:

(1) Band Pass Filtering

    The ECG signal is first bandpassed filtered between 5 and 15 Hz to eliminate
    noise due to muscle contractions, 60 Hz noise, baseline wander, and T-wave
    interference. As implemented in the Pan-Tompkins publication, a low and
    high pass filter are applied in series to acheive a frequency passband between
    5 and 12 Hz.

    LP ---> y(nT) = 2y(nT-T) - y(nT-2T) + x(nT) - 2x(nT - 6) + x(nT-12T)

    HP ---> y(nT) = 32x(nT - 16T) - [y(nT - T) + x(nT) - x(nT - 32T)]

    This code also applies an additional 5th order Butterworth filter with
    cutoff frequencies of 5 and 15 Hz to make this algorithm robust to noisier
    data sets.

(2) Derivative

    QRS slope information is computed via differentiation of the filtered ECG
    signal.

           y(nT) = (1/8T)[-x(nT-2T) - 2x(nT - T) + 2x(nT +T) + x(nT + 2T)]

(3) Squaring Function

    The squaring function serves for non-linear amplification the high frequency
    components of the derivative signal associated with the QRS complexes.

                             y(nT) = [x(nT)] ** 2

(4) Moving Integration Waveform

    A final waveform is created using a moving-window integrator. This waveform
    serves to obtain waveform feature information, with each rising edge
    corresponding to the location of the QRS complex (increased amplitude --> increased
    area)

           y(nT) = (1/N)[x(nT - (N - 1)T + x(nT - (N - 2)T) + ... + x(nT)]

    The width of the waveform was found empiracally in the publication to be
    30 samples wide for a sample frequency of 200 Hz. In order to increase
    the flexibility of this algorithm to signals sampled at different
    frequencies, the window width is automatically adjusted so that the window
    is approximately 150 ms wide regardless of sampling frequency.

(5) Fudicial Mark

    The rising edge of the integration waveform corresponds with the QRS complex.
    A fudicial mark indicating the temporal location of the QRS complex is made by
    locating the peaks of the integration waveform associated with the R peak of
    the QRS complex. This is done through differentiation, zero-crossing location,
    and moving average amplitude thresholding to eliminate peaks from the P and T
    wave features.

(6) Adjusting Signal and Noise Thresholds

     Following a brief two second initilization phase, two sets of signal and noise
     thresholds are adjustedfor both the integration waveform and the filtered ECG
     signal, respectively. These thresholds are based off previous peaks determined
     to be either signal peaks or noise peaks. Thresholds are able to adapt quickly to
     rapidly changing heart rates by keeping running estimates of both signal and
     noise levels from previous peak assignments. Thresholds are computed as follows
     for both the integration waveform and the filtered ECG:

     If signal peak  ---> SPK = 0.125 * Peak_Amplitude + 0.875 * SPK
     If noise peak   ---> NPK = 0.125 * Peak_Amplitude + 0.875 * NKP

                          THRESHOLD1 = NPK + 0.25 * (SPK - NPK)
                          THRESHOLD2 = 0.5 * THRESHOLD1

     A peak is considered to be a signal peak if it exceeds THRESHOLD1 or
     exceeds THRESHOLD2 if a searchback is triggered.

(6) RR Rate Limits

    Two heartbeats are needed to establish the average RR interval and rate
    limits. If any of the eight most recent sequential beats fall outside the the
    accepted low and high RR-interval limits, heart rate is considered to be
    irregular and the signal and noise thresholds are reduced by half in order to
    increase sensitivity.

(6) Searchback

    If a QRS complex is not found within 166% of the average of the previous
    eight beats during normal sinus rhythm, it is assumed that a QRS complex
    has been missed. A searchback process is then triggered, which finds
    the maximal peak within the current signal and noise thresholds to be
    a QRS complex candidate. If this QRS complex candidate exceeds THRESHOLD2,
    the signal levels will take more consideration of the current peak
    amplitude and less on the previous signal values via the following modification
    to the signal level running estimate:

                    SPK = 0.25 * Peak_Amplitude + 0.75 * SPKI

(7) T-wave Identification

    Once a QRS complex is identified, there is a 200 ms refractory in which it is
    physiologically impossible for another beat to occur, thus allowing for the
    elimination of any QRS detection during this time frame. If a QRS is detected
    after the refractory period but before 360 ms after the temporal location
    of the previous QRS detection, we must decide whether this peak is an actual
    QRS complex or a T-wave. If the slope of this peak is less than half of the
    slope of the previous QRS, it is identified as a T-wave.

(8) Detection

    A QRS is identified if it is identified in both the band-passed filtered ECG signal
    and in the integration waveform.

(9) Neighborhood Search

    A neighborhood search with a search window of 0.2 seconds is used to find the
    highest amplitude point in the general vicinity of the QRS complex. This is
    the location of the R-peak.

"""
import numpy as np
#from matplotlib import style
from scipy import signal
import matplotlib.pyplot as plt
#style.use('ggplot')

def panTompkins(ECG, fs, plot = False, decay = 0.999, rravg = 'qrs', offset = None, window = None):
    """
    Inputs:
    - ECG   : [list] | [numpy.ndarray] of ECG samples
    - fs    : [int] sampling frequency
    - plot  : [True|False] optional plot of R-peak detections overlayed on ECG signal

    Outputs:
    - Rpeaks : [list] of integers indicating R peak sample number locations
    """
    if type(ECG) == list or type(ECG) is np.ndarray:
        ECG = np.array(ECG)

    #Initialize
    RRAVERAGE1 = []
    RRAVERAGE2 = []
    IWF_signal_peaks = []
    IWF_noise_peaks = []
    noise_peaks = []
    ECG_bp_peaks = np.array([])
    ECG_bp_signal_peaks = []
    ECG_bp_noise_peaks = []
    final_R_locs = []
    T_wave_found = 0
    extra = []

    #LOW PASS FILTERING
    #Transfer function: H(z)=(1-z^-6)^2/(1-z^-1)^2
    a = np.array([1, -2, 1])
    b = np.array([1, 0, 0, 0, 0, 0, -2, 0, 0, 0, 0, 0, 1])

    impulse = np.repeat(0., len(b)); impulse[0] = 1.
    impulse_response = signal.lfilter(b,a,impulse)

    #convolve ECG signal with impulse response
    ECG_lp = np.convolve(impulse_response, ECG)
    ECG_lp = ECG_lp / (max(abs(ECG_lp)))
    delay = 12 #full convolution

    #HIGH PASS FILTERING
    #Transfer function: H(z)=(-1+32z^-16+z^-32)/(1+z^-1)
    a = np.array([1, -1])
    b = np.array([-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                  0, 0, 0, 32, -32, 0, 0, 0, 0, 0, 0, 0, 0,
                  0, 0, 0, 0, 0, 0, -1])

    impulse = np.repeat(0., len(b)); impulse[0] = 1.
    impulse_response = signal.lfilter(b,a,impulse)

    ECG_lp_hp = np.convolve(impulse_response, ECG_lp)
    ECG_lp_hp = ECG_lp_hp/(max(abs(ECG_lp_hp)))
    delay = delay + 32

    #BAND PASS FILTER
    nyq = fs / 2
    lowCut = 5 / nyq  #cut off frequencies are normalized from 0 to 1, where 1 is the Nyquist frequency
    highCut = 15 / nyq
    order = 5
    b,a = signal.butter(order, [lowCut, highCut], btype = 'bandpass')
    ECG_bp = signal.lfilter(b, a, ECG_lp_hp)

    #DIFFERENTIATION
    #Transfer function: H(z)=(1/8T)(-z^-2-2z^-1+2z^1+z^2)
    T = 1/fs
    b = np.array([-1, -2, 0, 2, 1]) * (1 / (8 * T))
    a = 1
    #Note impulse response of the filter with a = [1] is b
    ECG_deriv = np.convolve(ECG_bp, b)
    delay = delay + 4

    #SQUARING FUNCTION
    ECG_squared = ECG_deriv ** 2

    #MOVING INTEGRATION WAVEFORM
    N = int(np.ceil(0.150 * fs))
    ECG_movavg = np.convolve(ECG_squared,(1 / N) * np.ones((1, N))[0])

    #FUDICIAL MARK ON MOVING INTEGRATION WAVEFORM
    peaks = findPeaks(ECG_movavg)

    #LEARNING PHASE 1
    #2 second initialize phase for MIW, 25% of max amplitude considered signal, 50% of mean signal considered noise
    initializeTime = 2 * fs
    SPKI = max(ECG_movavg[:initializeTime]) * 0.25
    NPKI = np.mean(ECG_movavg[:initializeTime]) * 0.5
    THRESHOLDI1 = NPKI + 0.25 * (SPKI-NPKI)
    THRESHOLDI2 = 0.5 * THRESHOLDI1

    #2 second initialize for filtered signal, 25% of max amplitude considered signal, 50% of mean signal considered noise
    initializeTime = 2 * fs
    SPKF = max(ECG_bp[:initializeTime]) * 0.25
    NPKF = np.mean(ECG_bp[:initializeTime]) * 0.5
    THRESHOLDF1 = NPKF + 0.25 * (SPKF-NPKF)
    THRESHOLDF2 = 0.5 * THRESHOLDF1

    peaks = peaks[peaks > initializeTime] #ignore peaks that occur during initialization window

    for c,peak in enumerate(peaks):
        #find corresponding peaks in filtered ECG using neighborhood search window +- 0.15 seconds
        searchInterval = int(np.round(0.15 * fs))
        searchIndices = np.arange(peak - searchInterval, peak + searchInterval + 1, 1)
        #neighborhood search indices cannot be negative and cannot exceed length of filtered ECG
        if searchIndices[0] >= 0 and all(searchIndices <= len(ECG_bp)):
             ECG_bp_peaks = np.append(ECG_bp_peaks, np.where(ECG_bp == max(ECG_bp[searchIndices]))[0][0])
        else:
             ECG_bp_peaks = np.append(ECG_bp_peaks, np.where(ECG_bp == max(ECG_bp[searchIndices[0]:len(ECG_bp)-1])))
        #LEARNING PHASE 2
        if c > 0 and c < len(ECG_bp_peaks):
            # if c < 8:
            if len(ECG_bp_signal_peaks) < 8:
                if c == 1:
                    RRAVERAGE1 = []
                RRAVERAGE1_vec = np.diff(peaks[:c + 1]) / fs
                RRAVERAGE1_mean = np.mean(RRAVERAGE1_vec)
                RRAVERAGE1.append(RRAVERAGE1_mean)

                RRAVERAGE2 = [ RRAVERAGE1_mean ]
            else:
                if rravg == 'qrs': # AB use accepted qrs rather than any old peak
                    tmp_peaks = np.append(ECG_bp_signal_peaks[-8:], peaks[c])
                    RRAVERAGE1_vec = np.diff(tmp_peaks) / fs
                else:
                    RRAVERAGE1_vec = np.diff(peaks[c - 8:c + 1]) / fs
                RRAVERAGE1_mean = np.mean(RRAVERAGE1_vec)
                RRAVERAGE1.append(RRAVERAGE1_mean)

                rr = len(RRAVERAGE1_vec) - 1
                if RRAVERAGE1_vec[rr] > RR_LOW_LIMIT and RRAVERAGE1_vec[rr] < RR_HIGH_LIMIT:
                    RRAVERAGE2.append(RRAVERAGE1_vec[rr])
                if len(RRAVERAGE2) > 8:
                    del RRAVERAGE2[:len(RRAVERAGE2) - 8]

            # print('[%d] %0.1f sec: RRAVERAGE1 = %0.1f bpm, RRAVERAGE2 = %0.1f' % (c, peak/fs, 60/np.mean(RRAVERAGE1), 60/np.mean(RRAVERAGE2)))

            RR_LOW_LIMIT = 0.92 * np.mean(RRAVERAGE2)
            RR_HIGH_LIMIT = 1.16 * np.mean(RRAVERAGE2)
            RR_MISSED_LIMIT = 1.66 * np.mean(RRAVERAGE2)

            # AB: recover from bad thresholds, "He's dead Jim!" when noise makes the estimates large
            last_beat = 0;
            if len(ECG_bp_signal_peaks) > 0: last_beat = ECG_bp_signal_peaks[-1]
            if decay and peak - last_beat > 10 * RR_MISSED_LIMIT: # and c % int(fs/10) == 0:
                # RRAVERAGE2.append(RRAVERAGE1_vec[-1])
                # if len(RRAVERAGE2) > 8:
                #     del RRAVERAGE2[:len(RRAVERAGE2) - 8]
                NPKI *= decay
                SPKI *= decay
                NPKF *= decay
                SPKF *= decay
                THRESHOLDI1 = NPKI + 0.25 * (SPKI-NPKI)
                THRESHOLDI2 = 0.5 * THRESHOLDI1
                THRESHOLDF1 = NPKF + 0.25 * (SPKF - NPKF)
                THRESHOLDF2 = 0.5 * THRESHOLDF1


            #If irregular heart beat detected in previous 9 beats, lower signal thresholds by half to increase detection sensitivity
            current_RR_movavg = RRAVERAGE1[-1]
            if current_RR_movavg < RR_LOW_LIMIT or current_RR_movavg > RR_MISSED_LIMIT:
                #MIW thresholds
                THRESHOLDI1 = 0.5 * THRESHOLDI1
                THRESHOLDI2 = 0.5 * THRESHOLDI1
                #Filtered ECG thresholds
                THRESHOLDF1 = 0.5 * THRESHOLDF1
                THRESHOLDF2 = 0.5 * THRESHOLDF1

            #Search back triggered if current RR interval is greater than RR_MISSED_LIMIT
            currentRRint = RRAVERAGE1_vec[-1]
            if currentRRint > RR_MISSED_LIMIT:
                SBinterval = int(np.round(currentRRint * fs))
                #find local maximum in the search back interval between signal and noise thresholds
                SBdata_IWF = ECG_movavg[peak - SBinterval + 1:peak + 1]

                SBdata_IWF_filtered = np.where((SBdata_IWF > THRESHOLDI1))[0]

                if len(SBdata_IWF_filtered) > 0:
                    SBdata_max_loc = np.where(SBdata_IWF == max(SBdata_IWF[SBdata_IWF_filtered]))[0][0]
                    SB_IWF_loc = peak - SBinterval + 1 + SBdata_max_loc
                    IWF_signal_peaks.append(SB_IWF_loc)
                    #update signal and noise thresholds
                    SPKI = 0.25 * ECG_movavg[SB_IWF_loc] + 0.75 * SPKI
                    THRESHOLDI1 = NPKI + 0.25 * (SPKI - NPKI)
                    THRESHOLDI2 = 0.5 * THRESHOLDI1
                    #finding corresponding search back peak in ECG bandpass using 0.15 s neighborhood search window
                    if SB_IWF_loc < len(ECG_bp):
                        SBdata_ECGfilt = ECG_bp[SB_IWF_loc - round(0.15 * fs): SB_IWF_loc]
                    else:
                        SBdata_ECGfilt = ECG_bp[SB_IWF_loc - round(0.15 * fs):]
                    SBdata_ECGfilt_filtered = np.where((SBdata_ECGfilt > THRESHOLDF1))[0]
                    SBdata_max_loc2 = None
                    if len(SBdata_ECGfilt_filtered) > 0: # AB handle THRESHOLDF1 miss
                        SBdata_max_loc2 = np.where(SBdata_ECGfilt == max(SBdata_ECGfilt[SBdata_ECGfilt_filtered]))[0][0]


                    if SBdata_max_loc2 and ECG_bp[SB_IWF_loc - round(0.15 * fs) + SBdata_max_loc2] > THRESHOLDF2: #QRS complex detected in filtered ECG
                        #update signal and noise thresholds
                        SPKF = 0.25 * ECG_bp[SB_IWF_loc - round(0.15 * fs) + SBdata_max_loc2] + 0.75 * SPKF
                        THRESHOLDF1 = NPKF + 0.25 * (SPKF - NPKF)
                        THRESHOLDF2 = 0.5 * THRESHOLDF1
                        ECG_bp_signal_peaks.append(SB_IWF_loc - round(0.15 * fs) + SBdata_max_loc2)

            #T-WAVE AND QRS DISRCIMINATION
            if ECG_movavg[peak] >= THRESHOLDI1:
                if currentRRint > 0.20 and currentRRint < 0.36 and c > 0:
                    #Slope of current waveform (possible T wave)
                    #mean width of QRS complex: 0.06 - 0.10 sec
                    maxSlope_current = max(np.diff(ECG_movavg[peak - round(fs * 0.075):peak + 1]))
                    #slope of the waveform (most likely QRS) that preceeded it
                    maxSlope_past = max(np.diff(ECG_movavg[peaks[c - 1] - round(fs * 0.075): peaks[c - 1] + 1]))
                    if maxSlope_current < 0.5 * maxSlope_past: #T-wave found
                        T_wave_found = 1
                        #keep track of peaks marked as 'noise'
                        IWF_noise_peaks.append(peak)
                        #update Noise levels
                        NPKI = 0.125 * ECG_movavg[peak] + 0.875 * NPKI

                if not T_wave_found: #current peak is a signal peak
                    IWF_signal_peaks.append(peak)
                    #adjust signal levels
                    SPKI = 0.125 * ECG_movavg[peak]  + 0.875 * SPKI
                    #check if corresponding peak in filtered ECG is also a signal peak
                    if ECG_bp_peaks[c] > THRESHOLDF1:
                        SPKF = 0.125 * ECG_bp[c] + 0.875 * SPKF
                        ECG_bp_signal_peaks.append(ECG_bp_peaks[c])
                    else:
                        ECG_bp_noise_peaks.append(ECG_bp_peaks[c])
                        NPKF = 0.125 * ECG_bp[c] + 0.875 * NPKF

            elif ECG_movavg[peak] > THRESHOLDI1 and ECG_movavg[peak] < THRESHOLDI2:
                #update noise thresholds
                NPKI = 0.125 * ECG_movavg[peak]  + 0.875 * NPKI
                NPKF = 0.125 * ECG_bp[c] + 0.875 * NPKF

            elif ECG_movavg[peak] < THRESHOLDI1:
                #update noise thresholds
                noise_peaks.append(peak)
                NPKI = 0.125 * ECG_movavg[peak]  + 0.875 * NPKI
                ECG_bp_noise_peaks.append(ECG_bp_peaks[c])
                NPKF = 0.125 * ECG_bp[c] + 0.875 * NPKF
        else:  # first and last peaks
            if c == 0:
                RRAVERAGE1 = [np.nan]
                RRAVERAGE2 = [np.nan]

            if ECG_movavg[peak] >= THRESHOLDI1: #first peak is a signal peak
                IWF_signal_peaks.append(peak)
                #update signal  thresholds
                SPKI = 0.125 * ECG_movavg[peak]  + 0.875 * SPKI
                if ECG_bp_peaks[c] > THRESHOLDF1:
                    SPKF = 0.125 * ECG_bp[c] + 0.875 * SPKF
                    ECG_bp_signal_peaks.append(ECG_bp_peaks[c])
                else:
                    ECG_bp_noise_peaks.append(ECG_bp_peaks[c])
                    NPKF = 0.125 * ECG_bp[c] + 0.875 * NPKF

            elif ECG_movavg[peak] > THRESHOLDI2 and ECG_movavg[peak] < THRESHOLDI1:
                #update noise thresholds
                NPKI = 0.125 * ECG_movavg[peak]  + 0.875 * NPKI
                NPKF = 0.125 * ECG[c] + 0.875 * NPKF

            elif ECG_movavg[peak] < THRESHOLDI2:
                #update noise thresholds
                noise_peaks.append(peak)
                NPKI = 0.125 * ECG_movavg[peak]  + 0.875 * NPKI
                ECG_bp_noise_peaks.append(ECG_bp_peaks[c])
                NPKF = 0.125 * ECG_bp[c] + 0.875 * NPKF


        #reset
        T_wave_found = 0

        #update thresholds
        THRESHOLDI1 = NPKI + 0.25 * (SPKI - NPKI)
        THRESHOLDI2 = 0.5 * THRESHOLDI1

        THRESHOLDF1 = NPKF + 0.25 * (SPKF - NPKF)
        THRESHOLDF2 = 0.5 * THRESHOLDF1

        RRAVG1_now = np.mean(RRAVERAGE1)
        RRAVG2_now = np.mean(RRAVERAGE2)
        extra.append([NPKI, SPKI, NPKF, SPKF, RRAVG1_now, RRAVG2_now])

    #adjust for filter delays
    ECG_R_locs = [int(i - delay) for i in ECG_bp_signal_peaks]
    ECG_R_locs = np.unique(ECG_R_locs)

    #neighborhood search in raw ECG signal for increase accuracy of R peak detection
    for i in ECG_R_locs:
        ECG = np.array(ECG)
        searchInterval = int(np.round(0.02 * fs))
        searchIndices = np.arange(i - searchInterval, i + searchInterval + 1, 1)
        searchIndices = [i.item() for i in searchIndices] #convert to native Python int
        final_R_locs.append(np.where(ECG[searchIndices] == max(ECG[searchIndices]))[0][0] + searchIndices[0])

    #plot ECG signal with R peaks marked
    data = {'ECG': ECG, 'extra': extra, 'ECG_bp': ECG_bp, 'ECG_movavg': ECG_movavg, 'fs': fs, 'final_R_locs': final_R_locs, 'peaks': peaks}
    if plot:
        plot_panTompkins(data, offset = offset, window = window)
    else:
        pass

    return final_R_locs, data

def findPeaks(ECG_movavg):
    """finds peaks in Integration Waveform by smoothing, locating zero crossings, and moving average amplitude thresholding"""
    #smoothing
    N = 15
    ECG_movavg_smooth = np.convolve(ECG_movavg, np.ones((N,)) / N, mode = 'same')
    #signal derivative
    sigDeriv = np.diff(ECG_movavg_smooth)
    #find location of zero-crossings
    zeroCross = []
    for i,c in enumerate(np.arange(len(sigDeriv)-1)):
        if sigDeriv[i] > 0 and sigDeriv[i + 1] < 0:
            zeroCross.append(c)

    return np.array(zeroCross)

def plot_panTompkins(data, ax = None, offset = None, window = None):
    ECG = data['ECG']
    ECG_movavg = data['ECG_movavg']
    ECG_bp = data['ECG_bp']
    extra = data['extra']
    fs = data['fs']
    final_R_locs = data['final_R_locs']
    peaks = data['peaks']

    samples = np.arange(0, len(ECG))
    # print('%d samples in ECG, %d samples in ECG_bp, %d' % (len(ECG), len(ECG_bp), len(ECG_movavg)))
    #plt.autoscale(enable=True, axis='y', tight=True)
    if offset == None:
        offset = len(ECG)/fs/2
    if window == None:
        window = len(ECG)/fs
    sel = np.arange(int((offset-window/2)*fs),int((offset+window/2)*fs))

    if not ax:
       ax = list()
       ax[0:] = [plt.subplot(311)]
       ax[1:] = [plt.subplot(312)]
       ax[2:] = [plt.subplot(313)]

    ax[0].plot([i/fs for i in samples], ECG, color = 'b', linewidth = 1.0, label = 'ECG')
    ax[0].scatter([i/fs for i in final_R_locs], ECG[final_R_locs], color = 'r', s = 30, label = 'R')
    ax[0].set_ylabel('ECG')
    ax[0].set_ylim(min(ECG[sel]), max(ECG[sel]))
    ax[0].set_xlim(offset-window/2, offset+window/2)

    color = 'g'
    ECG_R_RRAVERAGE1 = [ n for i,j,k,m,n,p in extra]
    ECG_R_RRAVERAGE2 = [ p for i,j,k,m,n,p in extra]
    ax11 = ax[0].twinx()
    ax11.plot([i/fs for i in peaks], [60/j for j in ECG_R_RRAVERAGE2], color = color, linestyle = 'dashed', linewidth = 1.0, label = 'RR2')
    ax11.plot([i/fs for i in peaks], [60/j for j in ECG_R_RRAVERAGE1], color = 'r', linestyle = 'dotted', linewidth = 1.0, label = 'RR1')
    ax11.set_ylabel('RRAVG (bpm)', color = color)
    ax11.tick_params(axis = 'y', labelcolor = color)
    ax11.set_ylim(0,200)

    sel2 = sel + len(ECG)-len(ECG_bp)
    samples = np.arange(len(ECG)-len(ECG_bp), len(ECG))
    NPKF = [ k for i,j,k,m,n,p in extra]
    SPKF = [ m for i,j,k,m,n,p in extra]
    l1 = ax[1].plot([i/fs for i in samples], ECG_bp, color = 'b', linewidth = 1.0, label = 'ECG_bp')
    l2 = ax[1].plot([i/fs for i in peaks], NPKF, color = 'r', linestyle = 'dotted', linewidth = 1.0, label = 'NPKF')
    l3 = ax[1].plot([i/fs for i in peaks], SPKF, color = 'g', linestyle = 'dashed', linewidth = 1.0, label = 'SPKF')
    ax[1].set_ylabel('ECG bp')
    ax[1].set_ylim(min(ECG_bp[sel2]), max(ECG_bp[sel2]))
    ax[1].set_xlim(offset-window/2, offset+window/2)
    #ax2.set_ylim(min((NPKF[sel], SPKF[sel], ECG_bp[sel])), max((NPKF[sel], SPKF[sel], ECG_bp[sel])))
    #ax2.legend((l1, l2, l3), ('ECG', 'NPKF', 'SPKF'))

    sel3 = sel + len(ECG)-len(ECG_movavg)
    samples = np.arange(len(ECG)-len(ECG_movavg), len(ECG))
    NPKI = [ i for i,j,k,m,n,p in extra]
    SPKI = [ j for i,j,k,m,n,p in extra]
    l1 = ax[2].plot([i/fs for i in samples], ECG_movavg, color = 'b', linewidth = 1.0, label = 'ECG_movavg')
    l2 = ax[2].plot([i/fs for i in peaks], NPKI, color = 'r', linestyle = 'dotted', linewidth = 1.0, label = 'NPKI')
    l3 = ax[2].plot([i/fs for i in peaks], SPKI, color = 'g', linestyle = 'dashed', linewidth = 1.0, label = 'SPKI')
    ax[2].set_ylabel('ECG movavg')
    ax[2].set_ylim(min(ECG_movavg[sel3]), max(ECG_movavg[sel3]))
    ax[2].set_xlim(offset-window/2, offset+window/2)
    ax[2].set_xlabel('time (s)')
    #ax2.legend((l1, l2, l3), ('ECG', 'NPKI', 'SPKI'))
