% (C) A. Boyle, 2019 (BSD 3-clause license)
%  contact: boyle@sce.carleton.ca or alistair.js.boyle@gmail.com
%
% Copyright © 2019 Alistair Boyle. All Rights Reserved.
%
%   Redistribution and use in source and binary forms, with or without
%   modification, are permitted provided that the following conditions
%   are met:
%
%   1. Redistributions of source code must retain the above copyright
%      notice, this list of conditions and the following disclaimer.
%   2. Redistributions in binary form must reproduce the above copyright
%      notice, this list of conditions and the following disclaimer in the
%      documentation and/or other materials provided with the distribution.
%   3. The name of the author may not be used to endorse or promote
%      products derived from this software without specific prior written
%      permission.
%   THIS SOFTWARE IS PROVIDED BY [LICENSOR] "AS IS" AND ANY EXPRESS OR
%   IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
%   WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
%   ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
%   INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
%   (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
%   SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
%   HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
%   STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
%   IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
%   POSSIBILITY OF SUCH DAMAGE.
%
% based on
% [1] JIAPU PAN AND WILLIS J. TOMPKINS, A Real-Time QRS Detection Algorithm
%     IEEE TRANSACTIONS ON BIOMEDICAL ENGINEERING, VOL. BME-32, NO. 3, MARCH 1985

filename = '2018_12_05-10_35_00_Summary.csv';
P = readtable(filename, ...
    'HeaderLines', 0, ...
    'DatetimeType', 'text', ...
    'DurationType', 'text', ...
    'ReadVariableNames', true);
%P(1:3,:)

if 0
    P(1:100,:) = []; % delete noise at the start of recording (100s)
    % 1 second interval data
    figure(1); clf;
    subplot(411); plot(P.BR); xlabel('t (s)'); ylabel('BR');
    subplot(412); plot(P.BRAmplitude); xlabel('t (s)'); ylabel('BRAmplitude');
    subplot(413); plot(P.BRNoise); xlabel('t (s)'); ylabel('BRNoise');
    subplot(414); plot(P.BRConfidence); xlabel('t (s)'); ylabel('BRConfidence');

    figure(2); clf;
    subplot(511); plot(P.HR); xlabel('t (s)'); ylabel('HR');
    subplot(512); plot(P.ECGAmplitude); xlabel('t (s)'); ylabel('ECGAmplitude');
    subplot(513); plot(P.ECGNoise); xlabel('t (s)'); ylabel('ECGNoise');
    subplot(514); plot(P.HRConfidence); xlabel('t (s)'); ylabel('HRConfidence');
    subplot(515); plot(P.HRV); xlabel('t (s)'); ylabel('HRV');

    figure(3); clf;
    subplot(411); plot(P.SkinTemp);  xlabel('t (s)'); ylabel('SkinTemp');
    subplot(412); plot(P.Posture);   xlabel('t (s)'); ylabel('Posture');
    subplot(413); plot(P.Activity);  xlabel('t (s)'); ylabel('Activity');
    subplot(414); plot(P.PeakAccel); xlabel('t (s)'); ylabel('PeakAccel');

    close all
end

filename = '2018_12_05-10_35_00_ECG.csv';
Ts = 4e-3;
fs = 1/Ts;
ECG = readtable(filename, ...
    'HeaderLines', 0, ...
    'DatetimeType', 'text', ...
    'DurationType', 'text', ...
    'ReadVariableNames', true);
ECG = ECG.EcgWaveform;
t = [1:1:length(ECG)]*Ts;


tlim = [-0.5 +0.5]*30 + 1000; % looks good
tlim = [-0.5 +0.5]*10 + 2050; % problem area
tlim = [-0.5 +0.5]*10 + 1140; % nice data
tlim = [-0.5 +0.5]*10 + 2443; % big jump in rate: single bad beat
tlim = [-0.5 +0.5]*10 + 1910; % big jump in rate: single bad beat
tlim = [-0.5 +0.5]*10 + 1790; % jumpy RR
tlim = [0 t(end)]; % all data

% trim 100s of data at front: noise
sel = 1:round(800/Ts);
ECG(sel) = [];
t(sel) = [];

fprintf('loading data completed\n');

% Pan-Thomkins filtering, running offline
fc = [ 5 15 ];% Hz or [5 15] or [5 13]
[b, a] = butter(6, fc/fs);
ECGf = filtfilt(b, a, ECG);
if 0
    ECGi = [0; diff(ECGf)]; % could do better difference (5 pt?)
else
    b  = [1 2 0 -2 -1];
    ECGi = filtfilt(b, 1, ECGf);
end
ECGi = ECGi .^ 2;
if 0
    ECGi = movmean(ECGi,round(150e-3/Ts)); % 150 ms window
else
    fc = 1/150e-3;
    [b, a] = butter(6, fc/fs);
    ECGi = filtfilt(b, a, ECGi);
end
[~,idx] = findpeaks(ECGi);
fprintf('filtering completed\n');
% sort peaks
pks = zeros(size(idx));
spkf = pks; npkf = pks; thf = pks; % init
spki = pks; npki = pks; thi = pks; % init
missing = pks;
rr1 = zeros(8,1); rr2 = rr1;
rr_avg1 = pks; rr_avg2 = pks; rr = pks;
rr_low = 0; rr_high = 60; rr_miss = Ts;
t1 = 0;
off_ECGf_peak = pks;
miss_peaki = -inf; miss_peakf = -inf; miss_i = 0;
miss_last_r_i = 0; miss_last_r_t = t1;
check_t_peaki = 0;
for i = 1:length(pks)
    peaki = ECGi(idx(i));

    % find peak for filtered waveform
    j = 0;
    rng = round(150e-3/Ts);
    if 0 % hill climb
        % climb left
        while (abs(j) < rng) & (idx(i) + j > 1) & ...
                (ECGf(idx(i)+j) - ECGf(idx(i)+j-1) < 0)
            j = j - 1;
        end
    else % find largest peak in the window
        sel = max(1, idx(i)-rng):min(length(ECGf), idx(i));
        [~, idxmax] = max([ones(rng-(idx(i)-1),1)*-inf; ECGf(sel)]);
        j = idxmax - rng;
    end
    off_ECGf_peak(i) = j;
    peakf = ECGf(idx(i)+j);

    % is peak & > 200ms since last R
    pks(i) = (peaki > thi(i)) & (peakf > thf(i));

    % catch missing beats
    % we must have missed beat, and we have a candidate available
    if (t(idx(i)) - t1 > rr_miss) & (miss_i ~= 0)
        % record missed peak
        pks(miss_i) = 1; % miss_i != i, since we check peak i in the next block
        missing(miss_i) = 1;

        % update times
        t0 = t1; t1 = t(idx(miss_i));
        rr_new = (t1-t0);
        rr(miss_i) = rr_new;

        % tracking for missed beats
        miss_last_r_i = miss_i;
        miss_last_r_t = t1;

        % update signal and noise estimates
        % NOTE we update i, rather than i+1 since for ~pks(i),
        %   we set spki(i+1) = spki(i), spkf(i+1) = spkf(i) later
        spki(i) = 1/4*miss_peaki + 3/4*spki(i);
        spkf(i) = 1/4*miss_peakf + 3/4*spkf(i);

        % clear tracking of last non-peak candidate
        miss_peaki = -inf;
        miss_peakf = -inf;
        miss_i = 0; % no candidate

        % update average R-R intervals
        rr1 = [rr1(2:end); rr_new];
        if (sum(pks(1:i)) < 50) | ... % bootstrap rr_avg2
                (rr_new > rr_low) & (rr_new < rr_high) % nice signals
            rr2 = [rr2(2:end); rr_new];
        end
    end

    % R wave refactory period check < 200ms
    if pks(i) & (t(idx(i))-t1 < 200e-3)
        %fprintf('t=%0.1f sec (i=%d): R wave refactory period; R-R=%0.0f ms\n', t(idx(i)), i, (t(idx(i))-t1)*1e3);
        pks(i) = 0;
        missing(i) = 1;
    end

    % T-wave check: last R slope /2, if R-R < 360ms
    if pks(i) & (t(idx(i))-t1 < 360e-3) & (peaki < check_t_peaki/2)
        %fprintf('t=%0.1f sec (i=%d): suspect T wave; R-R=%0.0f ms\n', t(idx(i)), i, (t(idx(i))-t1)*1e3);
        pks(i) = 0;
        missing(i) = 1;
    end

    if 0 % (not in [1])
        % R-R rate increase limit: if R-R would be halved, its probably noise
        if pks(i) & (i>50) & (t(idx(i))-t1 < rr_avg1(i-1)/2)
            %fprintf('t=%0.1f sec (i=%d): suspect T wave; R-R=%0.0f ms\n', t(idx(i)), i, (t(idx(i))-t1)*1e3);
            pks(i) = 0;
            missing(i) = 1;
        end
    end

    % after missed beat update, update for next missed beat
    if ~pks(i) % not a candidate
        if (peaki > thi(i)/2) & (peakf > thf(i)/2) & ... % candidate
                (peaki > miss_peaki) % with higher peaki
            miss_peaki = peaki;
            miss_peakf = peakf;
            miss_i = i;
        end
    end

    % update R-R intervals
    if pks(i)
        t0 = t1; t1 = t(idx(i));
        rr_new = (t1-t0);
        rr(i) = rr_new;
        % tracking for missed beats
        miss_last_r_i = i;
        miss_last_r_t = t1;
        % clear tracking of last non-peak candidate
        miss_peaki = -inf;
        miss_peakf = -inf;
        miss_i = 0; % no candidate
        % track last peak slope for checking for T-waves
        check_t_peaki = peaki;

        % update average R-R intervals
        % comment: this part is touchy, it needs a good bootstrap at the
        %   start, and it sometimes wanders off when there is noisy data,
        %   so every 100 peaks, update avg2 anyways: allow avg2 to avg1
        %   eventually if avg1 is way out (not in [1])
        rr1 = [rr1(2:end); rr_new];
        if (sum(pks(1:i)) < 50) | ... % bootstrap rr_avg2 (not in [1])
                (mod(sum(pks(1:i)), 100) == 0) | ... % see comment above (not in [1])
                ((rr_new > rr_low) & (rr_new < rr_high)) % nice signals
            rr2 = [rr2(2:end); rr_new];
        end
    end

    % update smoothed R-R intervals
    % rr_avg1 == rr_avg2 for normal sinus rhythm for 8 beats
    rr_avg1(i) = mean(rr1);
    rr_avg2(i) = mean(rr2);
    % udpate R-R interval thresholds
    rr_low  = 0.92 * rr_avg2(i);
    rr_high = 1.16 * rr_avg2(i);
    rr_miss = 1.66 * rr_avg2(i);

    if i == length(idx)
        break; % last peak!
    end

    % update signal & noise estimates, thresholds
    % filtered waveform
    if pks(i) % signal
        spkf(i+1) = 1/8*peakf + 7/8*spkf(i);
        npkf(i+1) = npkf(i);
    else % noise
        spkf(i+1) = spkf(i);
        npkf(i+1) = 1/8*peakf + 7/8*npkf(i);
    end
    thf(i+1) = npkf(i+1) + 1/4*(spkf(i+1) - npkf(i+1));
    % integrated waveform
    if pks(i) % signal
        spki(i+1) = 1/8*peaki + 7/8*spki(i);
        npki(i+1) = npki(i);
    else % noise
        spki(i+1) = spki(i);
        npki(i+1) = 1/8*peaki + 7/8*npki(i);
    end
    thi(i+1) = npki(i+1) + 1/4*(spki(i+1) - npki(i+1));



end
pks = pks > 0;
missing = missing > 0;
fprintf('peak detection completed\n');

% refine R peaks
rng = round(150e-3/Ts);
off = zeros(size(pks)); % init
if 0
    for i = 1:length(pks)
        if ~pks(i) | ...
                (idx(i) == length(ECG) - round(rng/2))
            continue;
        end
        j = 0;
        % climb right
        while (abs(j) < rng) & (idx(i) + j +1 < length(ECG)) & ...
                (ECG(idx(i)+j+1) - ECG(idx(i)+j) > 0)
            j = j + 1;
        end
        % climb left
        while (abs(j) < rng) & (idx(i) + j > 1) & ...
                (ECG(idx(i)+j) - ECG(idx(i)+j-1) < 0)
            j = j - 1;
        end
        off(i) = j;
    end
else
    for i = 1:length(pks)
        sel = max(1, idx(i)-rng):min(length(ECG), idx(i)+rng);
        [~, idxmax] = max([ones(rng-(idx(i)-1),1)*-inf; ECG(sel)]);
        off(i) = idxmax - (rng+1);
    end
end
fprintf('finished climbing peaks\n');
fprintf('-- summary --\n');
fprintf('%d total beats\n', sum(pks));
fprintf('%d beats eliminated due to R-R refactory period or T-wave\n', sum(~pks & missing));
fprintf('%d beats infered by R-R miss\n', sum(pks & missing));
pks_i = find(pks,1);
pks_j = length(pks)- find(flipud(pks),1);
rr_time = t(pks_j) - t(pks_i);
pks_scale = [0 diff(t(pks))]/rr_time;
rr_avg1_weighted_mean = sum(rr_avg1(pks) .* pks_scale);
rr_avg2_weighted_mean = sum(rr_avg2(pks) .* pks_scale);
fprintf('%3.1f bpm (avg1)\n', 1/mean(rr_avg1_weighted_mean)*60);
fprintf('%3.1f bpm (avg2)\n', 1/mean(rr_avg2_weighted_mean)*60);
q = rr_avg1_weighted_mean / rr_avg2_weighted_mean;
if q > 1
    q = 1/q;
end
fprintf('%4.1f%% heart rate quality (avg1/avg2)\n', q*100);
spki_mean = sum(spki(pks) .* pks_scale);
npki_mean = sum(npki(pks) .* pks_scale);
fprintf('%4.1f dB SNR (ECGi)\n', 10*log10(spki_mean/npki_mean)); % signal already squared: x10 for dB
spkf_mean = sum(spkf(pks) .* pks_scale);
npkf_mean = sum(npkf(pks) .* pks_scale);
fprintf('%4.1f dB SNR (ECGf)\n', 20*log10(spkf_mean/npkf_mean));

% make a picture!
clf;
ax1 = subplot(411);
plot(t, ECG);
xlim(tlim);
xlabel('t (s)'); ylabel('ECG');
hold on;
plot(t(idx(pks)), ECG(idx(pks)), 'rs');
plot(t(idx(pks)+off(pks)), ECG(idx(pks)+off(pks)), 'r*');
plot(t(idx(missing)+off(missing)), ECG(idx(missing)+off(missing)), 'go');
hold off;
title('ECG');
legend({'ECG', 'QRS found', 'QRS'},'box','off');

ax2 = subplot(412);
h = plot(t(idx(pks))'*[1 1 1 1 1 1], ...
    1./[rr(pks) rr_avg1(pks) rr_avg2(pks)*[0.92 1.0 1.16 1.66]]*60, ...
    '.-');
ylabel('HR (bpm)'); xlabel('t (s)');
legend({'R-R', 'avg1', 'high', 'avg2', 'low', 'miss'}, 'box', 'off');
h(2).LineWidth = 2;
h(3).LineStyle = '--';
h(4).LineWidth = 2;
h(4).LineStyle = '--';
h(5).LineStyle = '--';
h(6).LineStyle = '--';
xlim(tlim);

ax3 = subplot(413);
plot(t, ECGf);
xlim(tlim);
xlabel('t (s)'); ylabel('filtered');
hold on;
plot(t(idx(pks)+off_ECGf_peak(pks)), ECGf(idx(pks)+off_ECGf_peak(pks)),'r*');
plot(t(idx(~pks)+off_ECGf_peak(~pks)), ECGf(idx(~pks)+off_ECGf_peak(~pks)),'ro');
plot(t(idx)'*[1 1 1], [spkf, npkf, thf], '--');
hold off;
legend({'filtered', 'QRS', 'non-QRS', 'signal floor', 'noise floor', 'threshold'},'box','off');

ax4 = subplot(414);
plot(t, ECGi);
xlim(tlim);
xlabel('t (s)'); ylabel('integrated');
hold on;
plot(t(idx(pks)), ECGi(idx(pks)),'r*');
plot(t(idx(~pks)), ECGi(idx(~pks)),'ro');
plot(t(idx)'*[1 1 1], [spki, npki, thi], '--');
hold off;
legend({'filtered', 'QRS', 'non-QRS peak', 'signal floor', 'noise floor', 'threshold'},'box','off');

linkaxes([ax1, ax2, ax3, ax4],'x')

ax1.XLim = tlim;
fprintf('\n');