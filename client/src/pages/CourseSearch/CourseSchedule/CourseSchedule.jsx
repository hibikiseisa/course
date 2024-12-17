import React, { useState } from 'react';
import './CourseSchedule.css';

const CourseSchedule = ({ isOpen, onClose, selectedPeriods, setSelectedPeriods }) => {
    if (!isOpen) return null;

    const handlePeriodClick = (day, period) => {
        const selected = `${day}-${period}`;
        setSelectedPeriods((prev) =>
            prev.includes(selected)
                ? prev.filter((item) => item !== selected)
                : [...prev, selected]
        );
    };

    const handlePeriodSubmit = () => {
        const databaseFormat = convertSelectedPeriodsToDatabaseFormat(selectedPeriods);
        console.log("Database Format:", databaseFormat); // 提交資料庫格式
        onClose();
    };

    const mapWeekdayToNumber = (weekday) => {
        const mapping = {
            "星期一": "1",
            "星期二": "2",
            "星期三": "3",
            "星期四": "4",
            "星期五": "5",
            "星期六": "6",
            "星期日": "7",
        };
        return mapping[weekday];
    };

    const convertSelectedPeriodsToDatabaseFormat = (selectedPeriods) => {
        const groupedPeriods = {};

        selectedPeriods.forEach((period) => {
            const [day, timeIndex] = period.split("-");
            const dayNumber = mapWeekdayToNumber(day);

            if (!groupedPeriods[dayNumber]) {
                groupedPeriods[dayNumber] = [];
            }
            groupedPeriods[dayNumber].push(timeIndex);
        });

        return Object.entries(groupedPeriods).map(([day, periods]) => ({
            day,
            periods: periods.join(","),
        }));
    };

    const handleSelectAll = () => {
        const allPeriods = [];
        ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"].forEach((day) => {
            for (let i = 1; i <= 14; i++) {
                allPeriods.push(`${day}-${i}`);
            }
        });
        if (selectedPeriods.length === allPeriods.length) {
            setSelectedPeriods([]); // 取消全選
        } else {
            setSelectedPeriods(allPeriods); // 全選
        }
    };

    const handleSelectDay = (day) => {
        const dayPeriods = [];
        for (let i = 1; i <= 14; i++) {
            dayPeriods.push(`${day}-${i}`);
        }
        const isAllSelected = dayPeriods.every((period) => selectedPeriods.includes(period));
        if (isAllSelected) {
            setSelectedPeriods((prev) => prev.filter((item) => !dayPeriods.includes(item))); // 取消當天選擇
        } else {
            setSelectedPeriods((prev) => [...prev, ...dayPeriods.filter((period) => !prev.includes(period))]); // 全選當天
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>選擇課表節次</h2>
                <div className="action-buttons">
                    <button onClick={handleSelectAll} className="select-all-button">
                        {selectedPeriods.length === 98 ? "取消全選" : "全選"}
                    </button>
                    {["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"].map((day) => (
                        <button
                            key={day}
                            onClick={() => handleSelectDay(day)}
                            className="select-day-button"
                        >
                            {`全選${day}`}
                        </button>
                    ))}
                </div>
                <table className="schedule-table">
                    <thead>
                        <tr>
                            <th>時間</th>
                            <th>星期一</th>
                            <th>星期二</th>
                            <th>星期三</th>
                            <th>星期四</th>
                            <th>星期五</th>
                            <th>星期六</th>
                            <th>星期日</th>
                        </tr>
                    </thead>
                    <tbody>
                        {["8:10~9:00", "9:10~10:00", "10:10~11:00",
                            "11:10~12:00", "12:40~13:30", "13:40~14:30",
                            "14:40~15:30", "15:40~16:30", "16:40~17:30",
                            "17:40~18:30", "18:35~19:25", "19:30~20:20",
                            "20:25~21:15", "21:20~22:10"].map((time, timeIndex) => (
                                <tr key={timeIndex}>
                                    <td>{time}</td>
                                    {["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"].map((day, dayIndex) => (
                                        <td key={dayIndex}>
                                            <button
                                                className={`period-cell ${selectedPeriods.includes(`${day}-${timeIndex + 1}`)
                                                    ? "selected"
                                                    : ""
                                                    }`}
                                                onClick={() => handlePeriodClick(day, timeIndex + 1)}
                                            >
                                                {selectedPeriods.includes(`${day}-${timeIndex + 1}`) ? "✔" : "+"}
                                            </button>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                    </tbody>
                </table>
                <div className="modal-buttons">
                    <button className="confirm-button" onClick={handlePeriodSubmit}>
                        確定
                    </button>
                    <button className="cancel-button" onClick={onClose}>
                        取消
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseSchedule;
