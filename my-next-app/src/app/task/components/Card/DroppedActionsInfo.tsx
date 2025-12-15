"use client"

import React from 'react'
import { useTaskStore } from '../../store/taskStore/taskStore'
import { useShallow } from 'zustand/shallow'


const DroppedActionsInfo = () => {

	const {quadrant} = useTaskStore(
		useShallow(state => ({
			quadrant: state.quadrant
		}))
	)

	// bg-cyan-100

	return (
		<div className="absolute inset-0 flex justify-around bg-white">
						<div className="flex-1 flex flex-col ">
							<div className={`flex-1 border border-cyan-300 
								${quadrant?.includes("topLeft") && "bg-cyan-100"}`}
							>
								<span className="text-xs text-cyan-500 ">
                このカードの上に移動
            		</span>
							</div>
							<div className={`flex-1 border border-cyan-300 
								${quadrant?.includes("bottomLeft") && "bg-cyan-100"}`}
							>
								<span className="text-xs text-cyan-500 ">
                このカードの下に移動
            		</span>
							</div>
						</div>
							<div className={`flex-1 border border-cyan-300 
								${quadrant?.includes("Right") && "bg-cyan-100"}`}
							>
							<span className="text-xs text-cyan-500 ">
                このカードの中に移動
            	</span>
						</div>
					</div>
	)
}

export default DroppedActionsInfo