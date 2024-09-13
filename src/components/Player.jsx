import { usePlayerStore } from "@/store/playerStore"
import { useEffect, useRef, useState } from "react"
import { Slider } from "./Slider"
import { VolumeControl } from "./VolumeControl"
import { Play, Pause, Prev, Next } from "../icons/MusicPlayer"

const CurrentSong = ({ image, title, artists }) => {
  return (
    <div className={`flex items-center gap-5 relative overflow-hidden`}>
      <picture className="w-16 h-16 bg-zinc-800 rounded-lg shadow-lg overflow-hidden">
        <img src={image} alt={title} />
      </picture>

      <div className="flex flex-col">
        <h3 className="font-semibold text-sm block">{title}</h3>
        <span className="text-xs opacity-80">{artists?.join(", ")}</span>
      </div>
    </div>
  )
}

const SongControl = ({ audio }) => {
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    audio.current.addEventListener("timeupdate", handleTimeUpdate)
    return () => {
      audio.current.removeEventListener("timeupdate", handleTimeUpdate)
    }
  }, [])

  const handleTimeUpdate = () => {
    setCurrentTime(audio.current.currentTime)
  }

  const formatTime = (time) => {
    if (time == null) return `0:00`
    const seconds = Math.floor(time % 60)
    const minutes = Math.floor(time / 60)

    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const duration = audio?.current?.duration ?? 0

  return (
    <div className="flex gap-x-3 text-xs pt-2">
      <span className="opacity-50 w-12 text-right">
        {formatTime(currentTime)}
      </span>

      <Slider
        defaultValue={[0]}
        value={[currentTime]}
        max={audio?.current?.duration ?? 0}
        min={0}
        className="w-[400px]"
        onValueChange={(value) => {
          const [newCurrentTime] = value
          audio.current.currentTime = newCurrentTime
        }}
      />

      <span className="opacity-50 w-12">
        {duration ? formatTime(duration) : "0:00"}
      </span>
    </div>
  )
}

export function Player() {
  const { currentMusic, setCurrentMusic, isPlaying, setIsPlaying, volume } =
    usePlayerStore((state) => state)
  const audioRef = useRef()

  useEffect(() => {
    isPlaying ? audioRef.current.play() : audioRef.current.pause()
  }, [isPlaying])

  useEffect(() => {
    audioRef.current.volume = volume
  }, [volume])

  useEffect(() => {
    const { song, playlist, songs } = currentMusic
    if (song) {
      const src = `/music/${playlist?.id}/0${song.id}.mp3`
      audioRef.current.src = src
      audioRef.current.volume = volume
      audioRef.current.play()
    }
  }, [currentMusic])

  // useEffect(() => {
  //   audioRef.current.src = `/music/1/01.mp3`
  // }, [])

  const handleClick = () => {
    setIsPlaying(!isPlaying)
  }

  const isSongLoader = !!currentMusic.song

  const getSongIndex = (id) => {
    return currentMusic.songs.findIndex((e) => e.id === id) ?? -1
  }

  const onNextSong = () => {
    const { song, playlist, songs } = currentMusic
    const index = getSongIndex(song.id)
    if (index > -1 && index + 1 < songs.length) {
      setIsPlaying(false)
      setCurrentMusic({ songs, playlist, song: songs[index + 1] })
      setIsPlaying(true)
    }
  }

  const onPrevSong = () => {
    const { song, playlist, songs } = currentMusic
    const index = getSongIndex(song.id)
    if (index > -1 && index > 0) {
      setIsPlaying(false)
      setCurrentMusic({ songs, playlist, song: songs[index - 1] })
      setIsPlaying(true)
    }
  }

  return (
    <div className="flex flex-row justify-between w-full z-50 items-center mt-[.5rem]">
      <div className="w-[250px]">
        <CurrentSong {...currentMusic.song} />
      </div>
      <div className="grid place-content-center gap-4 flex-1">
        <div className="flex justify-center flex-col items-center">
          <div className="flex gap-8">
            <button
              onClick={onPrevSong}
              title="Prev"
              disabled={!isSongLoader}
              className={`${!isSongLoader ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Prev />
            </button>

            <button
              title="Play / Pause"
              onClick={handleClick}
              disabled={!isSongLoader}
              className={`bg-white rounded-full p-2 ${!isSongLoader ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isPlaying ? <Pause /> : <Play />}
            </button>

            <button
              onClick={onNextSong}
              title="Next"
              disabled={!isSongLoader}
              className={`${!isSongLoader ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Next />
            </button>
          </div>
          {/* <button className="bg-white rounded-full p-2" onClick={handleClick}>
            {isPlaying ? <Pause /> : <Play />}
          </button> */}
          <SongControl audio={audioRef} />
          <audio ref={audioRef} />
        </div>
      </div>
      <div className="grid place-content-center">
        <VolumeControl />
      </div>
    </div>
  )
}
