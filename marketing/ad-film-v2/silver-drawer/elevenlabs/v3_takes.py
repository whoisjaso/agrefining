# v3_takes.py : ElevenLabs Eleven v3 read of the Silver drawer beats (one take per beat, several variants each).
# Key from the environment (ELEVENLABS_API_KEY); never hard-code it.
#   python3 v3_takes.py voices                 -> list voices on the account
#   python3 v3_takes.py takes VOICE_ID N [clean] -> N variants per beat into takes/<id>_<k>.mp3 (clean = Facebook alt)
import json, os, sys, urllib.request
KEY = os.environ.get('ELEVENLABS_API_KEY') or sys.exit('ELEVENLABS_API_KEY is not set')
H = {'xi-api-key': KEY, 'Content-Type': 'application/json'}
HERE = os.path.dirname(os.path.abspath(__file__))
def call(path, body=None):
    req = urllib.request.Request('https://api.elevenlabs.io' + path, data=json.dumps(body).encode() if body else None, headers=H, method='POST' if body else 'GET')
    return urllib.request.urlopen(req, timeout=300).read()
if sys.argv[1] == 'voices':
    for v in json.loads(call('/v1/voices'))['voices']:
        print(v['voice_id'], '|', v['name'], '|', v.get('labels'))
else:
    vid, n, clean = sys.argv[2], int(sys.argv[3]), 'clean' in sys.argv
    beats = json.load(open(os.path.join(HERE, 'beats_v3.json')))['beats']
    os.makedirs('takes', exist_ok=True)
    for b in beats:
        text = b.get('clean', b['text']) if clean else b['text']
        for k in range(n):
            audio = call(f'/v1/text-to-speech/{vid}?output_format=mp3_44100_192', {'text': text, 'model_id': 'eleven_v3', 'voice_settings': {'stability': 0.0}})
            out = f"takes/{b['id']}{'_clean' if clean else ''}_{k}.mp3"; open(out, 'wb').write(audio); print(out, len(audio))
