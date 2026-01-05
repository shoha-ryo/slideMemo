export const handleKeyDown = (e: React.KeyboardEvent) => {
		const current = document.activeElement as HTMLElement;
		// 1. 何もフォーカスされていない、または body にいる場合
		const isNothingFocused = !current || current === document.body;
		console.log(isNothingFocused);

		if (isNothingFocused) {
			const isArrowKey = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key);
			if (isArrowKey) {
				e.preventDefault();
				(document.querySelector(".board") as HTMLElement)?.focus();
			}
			return; // ここで終了させる（下の switch を実行させない）
		}

		switch (e.key) {
			case "ArrowDown":
				// 次のカードへ
				(current.nextElementSibling as HTMLElement)?.focus();
				break;
			case "ArrowUp":
				// 前のカードへ
				(current.previousElementSibling as HTMLElement)?.focus();
				break;
			case "ArrowRight": {
				// 1. 今のカードが所属している「ボード」を探す
				const currentBoard = current.closest('.board');
				// 2. その隣の「ボード」を探す
				const nextBoard = currentBoard?.nextElementSibling as HTMLElement;
				// 3. 隣のボードの中にある「最初のカード」にフォーカス
				nextBoard?.querySelector<HTMLElement>('.card')?.focus();
				break;
			}
			case "ArrowLeft": {
				e.preventDefault();
				const currentBoard = current.closest('.board');
				const prevBoard = currentBoard?.previousElementSibling as HTMLElement;
				(prevBoard?.querySelector<HTMLElement>('.card') || prevBoard)?.focus();
				break;
			}
			case "Enter":
			case " ":
				// dnd-kitのKeyboardSensorが反応してドラッグが始まる
				break;
		}
	};







export const handleGlobalKeyDown = (e: KeyboardEvent) => {
	const current = document.activeElement;

	// body にフォーカスがある（＝何も選択されていない）時だけ処理する
	if (current === document.body || current === null) {
		const isArrowKey = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key);
		
		if (isArrowKey) {
			// 最初のターゲットを探す
			const firstTarget = document.querySelector<HTMLElement>(".board, .card");
			
			if (firstTarget) {
				e.preventDefault();
				firstTarget.focus();
			}
		}
	}
};