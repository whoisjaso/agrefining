#!/bin/bash
# frame-exact splice: a (0-17.4 s) + b[0:270) + c1 + c2 (re-rendered 21.9-24.5 s) + b[426:] ; then the three deliverables
set -e
cd "$(dirname "$0")"
FC="[1:v]trim=start_frame=0:end_frame=270,setpts=PTS-STARTPTS[b1];[1:v]trim=start_frame=426,setpts=PTS-STARTPTS[b2];[0:v][b1][2:v][3:v][b2]concat=n=5:v=1:a=0[v]"
ffmpeg -v error -y -i out/a.mov -i out/b.mov -i out/c1.mov -i out/c2.mov -i master_nomusic.wav -filter_complex "$FC;[v]format=yuv420p10le[vo]" -map "[vo]" -map 4:a \
  -c:v libx265 -preset slow -crf 13 -tag:v hvc1 -x265-params log-level=error -c:a aac -b:a 320k -shortest -movflags +faststart final/ag-silver-drawer_master_2160x3840_60p_hevc10.mp4
ffmpeg -v error -y -i out/a.mov -i out/b.mov -i out/c1.mov -i out/c2.mov -i master_nomusic.wav -filter_complex "$FC;[v]noise=c0s=3:c0f=t+u,format=yuv420p[vo]" -map "[vo]" -map 4:a \
  -c:v libx264 -preset slow -crf 15 -profile:v high -level 5.2 -c:a aac -b:a 320k -shortest -movflags +faststart final/ag-silver-drawer_upload_2160x3840_60p.mp4
ffmpeg -v error -y -i final/ag-silver-drawer_upload_2160x3840_60p.mp4 -vf "scale=1080:1920:flags=lanczos" -c:v libx264 -preset slow -crf 18 -c:a copy -movflags +faststart final/ag-silver-drawer_review_1080x1920_60p.mp4
for f in final/*.mp4; do ffprobe -v error -count_frames -show_entries stream=codec_name,width,height,r_frame_rate,nb_read_frames:format=duration -of compact "$f" | tr '\n' ' '; echo; done
