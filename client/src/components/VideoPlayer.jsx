import { useEffect, useRef } from 'react';

function VideoPlayer({
  videoId = 'jfKfPfyJRdk',
  playState = 'paused',
  currentTime = 0,
  onTimeUpdate,
  onDurationChange,
}) {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const isPlayerReady = useRef(false);

  useEffect(() => {
    function createPlayer() {
      if (!containerRef.current) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '100%',
        width: '100%',
        videoId: videoId || 'jfKfPfyJRdk',
        playerVars: {
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin,
          enablejsapi: 1,
          autoplay: playState === 'playing' ? 1 : 0,
        },
        events: {
          onReady: (event) => {
            isPlayerReady.current = true;
            console.log('✅ YouTube Player is Ready:', event.target);

            // Report video duration once available
            if (onDurationChange && typeof event.target.getDuration === 'function') {
              const dur = event.target.getDuration();
              if (dur > 0) onDurationChange(dur);
            }

            // Sync initial play state
            if (playState === 'playing') {
              event.target.playVideo();
            } else {
              event.target.pauseVideo();
            }
          },
          onStateChange: (event) => {
            if (onDurationChange && typeof event.target.getDuration === 'function') {
              const dur = event.target.getDuration();
              if (dur > 0) onDurationChange(dur);
            }
          },
        },
      });
    }

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, []);

  // Sync play / pause
  useEffect(() => {
    if (!isPlayerReady.current || !playerRef.current) return;
    try {
      if (playState === 'playing') {
        playerRef.current.playVideo();
      } else if (playState === 'paused') {
        playerRef.current.pauseVideo();
      }
    } catch (err) {
      console.warn('Playback error:', err);
    }
  }, [playState]);

  // Sync video ID change
  useEffect(() => {
    if (!isPlayerReady.current || !playerRef.current || !videoId) return;
    try {
      if (typeof playerRef.current.loadVideoById === 'function') {
        playerRef.current.loadVideoById({
          videoId,
          startSeconds: currentTime || 0,
        });
      }
    } catch (err) {
      console.warn('Failed to load video ID:', err);
    }
  }, [videoId]);

  // Sync seek / currentTime change (threshold > 2s drift)
  useEffect(() => {
    if (!isPlayerReady.current || !playerRef.current) return;
    try {
      const actualTime = playerRef.current.getCurrentTime();
      const drift = Math.abs(actualTime - currentTime);
      if (drift > 2) {
        playerRef.current.seekTo(currentTime, true);
      }
    } catch (err) {
      console.warn('Seek error:', err);
    }
  }, [currentTime]);

  // Smooth time ticker while playing to update UI progress bar
  useEffect(() => {
    if (!onTimeUpdate) return;

    const interval = setInterval(() => {
      if (isPlayerReady.current && playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const curr = playerRef.current.getCurrentTime();
          onTimeUpdate(curr);
        } catch {
          // ignore
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [onTimeUpdate]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full aspect-video bg-black rounded-lg overflow-hidden"
    />
  );
}

export default VideoPlayer;