import { intervalToDuration } from 'date-fns'


export const formatDuration = (seconds: number): string => {
    const duration = intervalToDuration({ start: 0, end: seconds * 1000 });

    const hrs = duration.hours || 0;
    const mins = duration.minutes || 0;
    const secs = duration.seconds || 0;

    const paddedMins = mins < 10 ? `0${mins}` : mins;
    const paddedSecs = secs < 10 ? `0${secs}` : secs;
    
    if (hrs > 0) {
        return `${hrs}:${paddedMins}:${paddedSecs}`;
    }

    return `${mins}:${paddedSecs}`;
};