import React from 'react'

const DroppedActionsInfo = () => {
	return (
		<div className="absolute inset-0 flex justify-around bg-cyan-100">
						<div className="flex-1 flex flex-col ">
							<div className="flex-1 border border-cyan-300">
								<span className="text-xs text-cyan-500 ">
                このカードの上に移動
            		</span>
							</div>
							<div className="flex-1 border border-cyan-300">
								<span className="text-xs text-cyan-500 ">
                このカードの下に移動
            		</span>
							</div>
						</div>
						<div className="flex-1 border border-cyan-300">
							<span className="text-xs text-cyan-500 ">
                このカードの中に移動
            	</span>
						</div>
					</div>
	)
}

export default DroppedActionsInfo