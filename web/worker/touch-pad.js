(() => {
	const pad = document.createElement("div");
	pad.id = "touch-pad";
	pad.innerHTML = '<button id="tp-fs" type="button" tabindex="-1">\u26F6 Fullscreen</button>' +
		'<button data-key="W" type="button" tabindex="-1">W</button>' +
		'<div class="row"><button data-key="A" type="button" tabindex="-1">A</button><button data-key="S" type="button" tabindex="-1">S</button><button data-key="D" type="button" tabindex="-1">D</button></div>' +
		'<div class="row"><button id="tp-lmb" class="mouse" type="button" tabindex="-1">\u041B\u041A\u041C</button><button id="tp-rmb" class="mouse" type="button" tabindex="-1">\u041F\u041A\u041C</button></div>';
	document.body.append(pad);
	const host = document.getElementById("client-host");
	const inputBox = document.getElementById("input");
	// last pointer position over the page (not over the pad): the LMB / RMB buttons click there; before any move, the map's centre
	let last = null;
	addEventListener("pointermove", (e) => { if (!pad.contains(e.target)) last = [e.clientX, e.clientY]; }, true);
	addEventListener("pointerdown", (e) => { if (!pad.contains(e.target)) last = [e.clientX, e.clientY]; }, true);
	const pos = () => { if (last) return last; const r = host.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
	// WASD: the page's own key handlers read e.code, so fake key events on window drive the walk (incl. movement prediction)
	const key = (k, down) => dispatchEvent(new KeyboardEvent(down ? "keydown" : "keyup", { key: k.toLowerCase(), code: "Key" + k, bubbles: true, cancelable: true }));
	for (const b of pad.querySelectorAll("button[data-key]")) {
		const k = b.dataset.key; let held = false;
		const stop = (e) => { if (!held) return; held = false; b.classList.remove("on"); key(k, false); };
		b.addEventListener("pointerdown", (e) => { e.preventDefault(); inputBox.blur(); b.setPointerCapture?.(e.pointerId); if (held) return; held = true; b.classList.add("on"); key(k, true); });
		b.addEventListener("pointerup", stop); b.addEventListener("pointercancel", stop); b.addEventListener("lostpointercapture", stop);
		b.addEventListener("contextmenu", (e) => e.preventDefault());
	}
	// one click at the cursor: mousedown + mouseup, the way the page's own mouse handlers expect (button 0 = left, 2 = right)
	const click = (button) => {
		const [x, y] = pos(), o = { bubbles: true, cancelable: true, clientX: x, clientY: y, button, buttons: button === 2 ? 2 : 1, detail: 1 };
		inputBox.blur();
		host.dispatchEvent(new MouseEvent("mousedown", o));
		host.dispatchEvent(new MouseEvent("mouseup", { ...o, buttons: 0 }));
	};
	for (const [id, button] of [["tp-lmb", 0], ["tp-rmb", 2]]) {
		const b = document.getElementById(id);
		b.addEventListener("pointerdown", (e) => e.preventDefault());
		b.addEventListener("click", () => click(button));
		b.addEventListener("contextmenu", (e) => e.preventDefault());
	}
	// fullscreen toggle
	const fs = document.getElementById("tp-fs"), de = document.documentElement;
	const isFs = () => document.fullscreenElement || document.webkitFullscreenElement;
	fs.addEventListener("pointerdown", (e) => e.preventDefault());
	fs.addEventListener("click", () => {
		try {
			if (isFs()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
			else (de.requestFullscreen || de.webkitRequestFullscreen).call(de);
		} catch {}
	});
})();
