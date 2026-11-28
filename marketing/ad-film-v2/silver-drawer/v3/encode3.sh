#!/bin/bash
# v3: frame-exact splice of the two 1080x1920 ProRes chunks (concat demuxer, no re-decode split), then the deliverables
set -e
cd "$(dirname "$0")"
printf "file 'v3a.mov'\nfile 'v3b.mov'\n" > out/splice3.txt
ffmpeg -v error -y -f concat -safe 0 -i out/splice3.txt -c copy out/v3.mov
ffmpeg -v error -y -i out/v3.mov -i master_nomusic.wav -map 0:v -map 1:a -vf "noise=c0s=3:c0f=t+u,format=yuv420p" \
  -c:v libx264 -preset slow -crf 14 -profile:v high -level 4.2 -x264-params frame-threads=2 -c:a aac -b:a 320k -shortest -movflags +faststart final/ag-silver-drawer-v3_upload_1080x1920_60p.mp4
ffmpeg -v error -y -i out/v3.mov -i master_nomusic.wav -map 0:v -map 1:a -vf "format=yuv420p10le" \
  -c:v libx265 -preset medium -crf 14 -tag:v hvc1 -x265-params log-level=error:frame-threads=2 -c:a aac -b:a 320k -shortest -movflags +faststart final/ag-silver-drawer-v3_master_1080x1920_60p_hevc10.mp4
for f in final/ag-silver-drawer-v3*.mp4; do ffprobe -v error -count_frames -show_entries stream=codec_name,width,height,r_frame_rate,nb_read_frames:format=duration -of compact "$f" | tr '\n' ' '; echo; done
