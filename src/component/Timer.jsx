import React, { useEffect, useState } from "react";


const Timer = ({seconds, onTimeUp}) => {
    const [timeLeft,setTimeLeft]=useState(seconds);
    useEffect(()=>{
        const intervalId=setInterval(()=>{
            setTimeLeft((prevTime)=>{
                if(prevTime<=1){
                    clearInterval(intervalId);
                    onTimeUp();
                    return 0;
                }
                return prevTime-1;
            });
        },1000);
            return ()=>clearTimeout(intervalId);
        
}, []);

const formatTime=(time)=>{
    const minutes=Math.floor(time/60);
    const seconds=time%60;
    return `${minutes}:${seconds<10?"0":""}${seconds}`;
}
return(
    <div className={`text-lg font-bold mt-2 ${timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-black"}`}>
            ⏳ Time Left: {formatTime(timeLeft)}
        </div>
);
};

export default Timer;
