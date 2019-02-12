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
tlim = [0 t(end)]; % all data
tlim = [-0.5 +0.5]*10 + 1140; % nice data



% trim 100s of data at front: noise
sel = 1:round(800/Ts);
ECG(sel) = [];
t(sel) = [];

fprintf('loading data completed\n');

% Pan-Thomkins filtering, running offline
fc = [ 5 12 ];% Hz or [5 15] or [5 13]
[b, a] = butter(4, fc/fs);
ECGf = filtfilt(b, a, ECG);
if 0
    ECGi = [diff(ECGf); 0]; % could do better difference (5 pt?)
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
rr_low = 0; rr_high = 60; rr_miss = 0;
t1 = 0;
off_ECGf = pks;
for i = 1:length(pks)
    peaki = ECGi(idx(i));

    % find peak for filtered waveform: hill climb
    j = 0;
    rng = round(150e-3/Ts);
    % climb right
    while (abs(j) < rng) & (idx(i) + j +1 < length(ECG)) & ...
           (ECGf(idx(i)+j+1) - ECGf(idx(i)+j) > 0)
       j = j + 1;
    end
    % climb left
    while (abs(j) < rng) & (idx(i) + j > 1) & ...
            (ECGf(idx(i)+j) - ECGf(idx(i)+j-1) < 0)
        j = j - 1;
    end
    off_ECGf(i) = j;
    peakf = ECGf(idx(i)+j);

    % is peak?
    pks(i) = (peaki > thi(i)) & (peakf > thf(i));

    % update R-R intervals
    if pks(i)
        t0 = t1; t1 = t(idx(i));
        rr_new = (t1-t0);
        rr(i) = rr_new;

        % update average R-R intervals
        rr1 = [rr1(2:end); rr_new];
        if (sum(pks(1:i)) < 50) | ... % bootstrap rr_avg2
                (rr_new > rr_low) & (rr_new < rr_high) % nice signals
            rr2 = [rr2(2:end); rr_new];
        else % TODO increase sensitivity for irregular signals
%             missing(i) = 1;
%             spkf(i) = spkf(i)/2;
%             spki(i) = spki(i)/2;
        end
        rr_avg1(i) = mean(rr1);
        rr_avg2(i) = mean(rr2);
        % rr_avg1 == rr_avg2 for normal sinus rhythm for 8 beats

        % udpate R-R thresholds
        rr_low  = 0.92 * rr_avg2(i);
        rr_high = 1.16 * rr_avg2(i);
        rr_miss = 1.66 * rr_avg2(i);
    end

    % catch missing beats
    if 0 & ~pks(i) & (i > 1) & ...
            (t(idx(i)) - t1 > rr_miss)
        n = find(flipud(pks(1:i)), 1);
        if length(n) == 0
            n = i;
        end
        sel = zeros(size(pks));
        sel = i-n+1:i-1;
        tmp = i-n + ...
         find((peakiF(sel) > thi(i)/2) & ...
         (peakfF(sel) > thf(i)/2));
        if length(tmp) == 0
            break;
        end
        [~, tmpidx] = max(tmp);
        ii = i-n + tmpidx;
        pks(ii) = 1;
        t0 = t1; t1 = t(idx(ii));
        rr_new = (t1-t0);
        rr1 = [rr1(2:end); rr_new];
        missing(ii);
    end



    if i == length(idx)
        break; % last peak!
    end

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

% refine peaks
rng = round(150e-3/Ts);
off = zeros(size(pks)); % init
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
fprintf('finished climbing peaks\n');

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
plot(t(idx(pks)+off_ECGf(pks)), ECGf(idx(pks)+off_ECGf(pks)),'r*');
plot(t(idx(~pks)+off_ECGf(~pks)), ECGf(idx(~pks)+off_ECGf(~pks)),'ro');
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