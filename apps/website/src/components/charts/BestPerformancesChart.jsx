import React from 'react';

const formatMinutes = (minutes) => {
    if (minutes < 60) {
        return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
        return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
};

const BestPerformancesChart = ({ activities, sessions }) => {
    const formatTimeIntuitive = (minutes) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (remainingMinutes === 0) return `${hours}h`;
        return `${hours}h ${remainingMinutes}m`;
    };

    // Calculate most done activity
    const activityTimes = {};
    sessions.forEach(session => {
        const activity = activities.find(a => a.id === session.activity_id);
        if (activity) {
            activityTimes[activity.id] = (activityTimes[activity.id] || 0) + session.duration_minutes;
        }
    });

    const mostDoneActivity = activities.reduce((max, activity) => {
        const time = activityTimes[activity.id] || 0;
        const maxTime = activityTimes[max?.id] || 0;
        return time > maxTime ? activity : max;
    }, null);

    const mostDoneTime = mostDoneActivity ? (activityTimes[mostDoneActivity.id] || 0) : 0;

    // Calculate best day (most productive day)
    const dailyTotals = {};
    sessions.forEach(session => {
        const date = new Date(session.started_at).toISOString().split('T')[0];
        dailyTotals[date] = (dailyTotals[date] || 0) + session.duration_minutes;
    });

    const bestDay = Object.entries(dailyTotals).reduce((max, [date, time]) => {
        return time > max.time ? { date, time } : max;
    }, { date: null, time: 0 });

    // Calculate average session length
    const avgSessionLength = sessions.length > 0
        ? sessions.reduce((sum, session) => sum + session.duration_minutes, 0) / sessions.length
        : 0;

    return (
        <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Best Performances</h3>
            <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400 mb-1">
                        {mostDoneActivity ? mostDoneActivity.name : 'None'}
                    </div>
                    <div className="text-sm text-zinc-400 mb-2">Most Done Activity</div>
                    <div className="text-lg font-semibold text-zinc-100">
                        {formatTimeIntuitive(mostDoneTime)}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-400 mb-1">
                        {bestDay.date ? new Date(bestDay.date).toLocaleDateString() : 'None'}
                    </div>
                    <div className="text-sm text-zinc-400 mb-2">Best Day</div>
                    <div className="text-lg font-semibold text-zinc-100">
                        {formatTimeIntuitive(bestDay.time)}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-1">
                        {formatTimeIntuitive(Math.round(avgSessionLength))}
                    </div>
                    <div className="text-sm text-zinc-400 mb-2">Avg Session</div>
                    <div className="text-lg font-semibold text-zinc-100">
                        {sessions.length} sessions
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BestPerformancesChart;
