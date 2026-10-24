import { n as e, t } from "./markdown-_rEhdm09.js";
import { Fragment as n, jsx as r, jsxs as i } from "react/jsx-runtime";
import { useEffect as a, useLayoutEffect as o, useRef as s, useState as c } from "react";
// src/lib/Box.tsx
var l = ({ title: e, footer: t, active: n = !0, className: a = "", children: o }) => /* @__PURE__ */ i("section", {
	className: `box ${n ? "is-active" : ""} ${a}`,
	children: [
		e !== void 0 && /* @__PURE__ */ r("header", {
			className: "box-title",
			children: e
		}),
		/* @__PURE__ */ r("div", {
			className: "box-body",
			children: o
		}),
		t !== void 0 && /* @__PURE__ */ r("footer", {
			className: "box-footer",
			children: t
		})
	]
}), u = (e) => {
	let { mode: t, message: n } = e;
	return t.kind === "command" ? /* @__PURE__ */ r(d, {
		prefix: ":",
		complete: e.completeCommand,
		onSubmit: (t) => e.onCommand?.(t),
		onCancel: e.onCancel
	}) : t.kind === "search" ? /* @__PURE__ */ r(d, {
		prefix: "/",
		onChange: e.onSearchChange,
		onSubmit: () => e.onSearchDone?.(!0),
		onCancel: () => e.onSearchDone?.(!1),
		onBlur: () => e.onSearchDone?.(!0)
	}) : t.kind === "prompt" && "label" in t ? /* @__PURE__ */ r(d, {
		prefix: t.label,
		initial: "initial" in t ? t.initial : void 0,
		complete: "complete" in t ? t.complete : void 0,
		onSubmit: (t) => e.onPrompt?.(t),
		onCancel: e.onCancel
	}) : t.kind === "confirm" && "question" in t ? /* @__PURE__ */ r("div", {
		className: "bottomline warn",
		children: t.question
	}) : /* @__PURE__ */ r("div", {
		className: `bottomline ${n?.kind === "error" ? "error" : ""}`,
		children: n ? n.kind === "error" && !n.text.startsWith("E") ? `E: ${n.text}` : n.text : ""
	});
}, d = ({ prefix: e, onChange: t, onSubmit: n, onCancel: a, onBlur: o = a, initial: s = "", complete: l }) => {
	let [u, d] = c(s);
	return /* @__PURE__ */ i("div", {
		className: "bottomline",
		children: [/* @__PURE__ */ r("span", { children: e }), /* @__PURE__ */ r("input", {
			autoFocus: !0,
			className: "prompt-input",
			value: u,
			spellCheck: !1,
			onChange: (e) => {
				d(e.target.value), t?.(e.target.value);
			},
			onBlur: o,
			onFocus: (e) => e.currentTarget.setSelectionRange(u.length, u.length),
			onKeyDown: (e) => {
				if (e.key === "Enter") e.preventDefault(), n(u);
				else if (e.key === "Tab" && l) {
					e.preventDefault();
					let t = l(u);
					t !== null && d(t);
				} else (e.key === "Escape" || e.key === "Backspace" && u === "") && (e.preventDefault(), a());
			},
			"aria-label": e
		})]
	});
}, f = (e) => (t) => {
	let n = t.lastIndexOf(" ") + 1, r = t.slice(n), i = e.find((e) => e.startsWith(r) && e !== r);
	return i === void 0 ? null : t.slice(0, n) + i;
}, p = (e, t) => `${e} ${t}${e === 1 ? "" : "s"}`, m = (e, t) => {
	let n = e.toLowerCase(), r = 0;
	for (let e of t.toLowerCase()) {
		if (r = n.indexOf(e, r), r === -1) return !1;
		r++;
	}
	return !0;
}, h = (e = 900) => {
	let t = `(min-width: ${e}px)`, [n, r] = c(() => globalThis.matchMedia(t).matches);
	return a(() => {
		let e = globalThis.matchMedia(t), n = () => r(e.matches);
		return e.addEventListener("change", n), () => e.removeEventListener("change", n);
	}, [t]), n;
}, g = () => {
	let [e, t] = c(() => /* @__PURE__ */ new Date());
	return a(() => {
		let e = setInterval(() => t(/* @__PURE__ */ new Date()), 15e3);
		return () => clearInterval(e);
	}, []), e;
}, _ = () => /* @__PURE__ */ r("span", { children: g().toLocaleTimeString([], {
	hour: "2-digit",
	minute: "2-digit"
}) }), v = (e, t) => {
	let [n, r] = c(() => {
		try {
			let n = localStorage.getItem(e);
			return n === null ? t : JSON.parse(n);
		} catch {
			return t;
		}
	});
	return [n, (t) => {
		r(t);
		try {
			localStorage.setItem(e, JSON.stringify(t));
		} catch {}
	}];
}, y = (e) => {
	try {
		let t = JSON.parse(localStorage.getItem(e) ?? "[]");
		return new Set(Array.isArray(t) ? t.filter((e) => typeof e == "string") : []);
	} catch {
		return /* @__PURE__ */ new Set();
	}
}, b = (e, t) => {
	try {
		localStorage.setItem(e, JSON.stringify([...t]));
	} catch {}
	return t;
}, x = (e) => {
	let [t, n] = c(() => y(e));
	return {
		folded: t,
		toggleFold: (t) => n((n) => {
			let r = new Set(n);
			return r.has(t) ? r.delete(t) : r.add(t), b(e, r);
		}),
		setAllFolded: (t, r) => n((n) => {
			let i = new Set(n);
			for (let e of t) r ? i.add(e) : i.delete(e);
			return b(e, i);
		})
	};
}, S = () => {
	let [e, t] = c(() => /* @__PURE__ */ new Set());
	return {
		selected: e,
		toggle: (e) => t((t) => {
			let n = new Set(t);
			return n.has(e) ? n.delete(e) : n.add(e), n;
		}),
		clear: () => t(/* @__PURE__ */ new Set()),
		setSelected: t
	};
}, C = ({ onCancel: e, children: t }) => /* @__PURE__ */ r("div", {
	className: "overlay",
	onMouseDown: (t) => t.target === t.currentTarget && e(),
	children: t
}), ee = ["Escape"], w = [
	"Escape",
	"q",
	"?",
	"Enter"
], T = ({ title: e, footer: t, onClose: n, closeKeys: i = ee, onKeyDown: o, className: c = "", children: u }) => {
	let d = s({
		onClose: n,
		closeKeys: i
	});
	return a(() => {
		d.current = {
			onClose: n,
			closeKeys: i
		};
	}), a(() => {
		let e = (e) => {
			d.current.closeKeys.includes(e.key) && (e.key.length === 1 && e.target instanceof Element && e.target.closest("input, textarea") || (e.preventDefault(), e.stopPropagation(), d.current.onClose()));
		};
		return globalThis.addEventListener("keydown", e, !0), () => globalThis.removeEventListener("keydown", e, !0);
	}, []), /* @__PURE__ */ r(C, {
		onCancel: n,
		children: /* @__PURE__ */ r("div", {
			onKeyDown: o,
			children: /* @__PURE__ */ r(l, {
				title: e,
				className: `dialog ${c}`,
				footer: t,
				children: u
			})
		})
	});
}, E = ({ title: e, items: t, onPick: n, onCancel: o, footer: u = "type to filter · ↑↓ move · enter pick · esc cancel" }) => {
	let [d, f] = c(""), [p, h] = c(0), g = s(null), _ = d ? t.filter((e) => m(e.label, d)) : t, v = Math.min(p, Math.max(0, _.length - 1));
	return a(() => {
		g.current?.children[v]?.scrollIntoView({ block: "nearest" });
	}, [v]), /* @__PURE__ */ r(C, {
		onCancel: o,
		children: /* @__PURE__ */ i(l, {
			title: e,
			className: "picker",
			footer: u,
			children: [/* @__PURE__ */ i("div", {
				className: "picker-query",
				children: [
					/* @__PURE__ */ r("span", {
						className: "accent",
						children: "❯ "
					}),
					/* @__PURE__ */ r("input", {
						autoFocus: !0,
						className: "prompt-input",
						value: d,
						onChange: (e) => {
							f(e.target.value), h(0);
						},
						onKeyDown: (e) => {
							let r = e.key === "ArrowDown" || e.ctrlKey && (e.key === "n" || e.key === "j"), i = e.key === "ArrowUp" || e.ctrlKey && (e.key === "p" || e.key === "k");
							if (r || i) e.preventDefault(), h((v + (r ? 1 : -1) + _.length) % Math.max(1, _.length));
							else if (e.key === "Enter") e.preventDefault(), _[v] && n(_[v].id);
							else if (e.key === "Escape") e.preventDefault(), o();
							else if (!d && !e.ctrlKey && !e.metaKey && !e.altKey) {
								let r = t.find((t) => t.hotkey === e.key);
								r && (e.preventDefault(), n(r.id));
							}
						},
						spellCheck: !1,
						"aria-label": e
					}),
					/* @__PURE__ */ i("span", {
						className: "dim",
						children: [
							_.length,
							"/",
							t.length
						]
					})
				]
			}), /* @__PURE__ */ i("ul", {
				ref: g,
				className: "picker-list",
				children: [_.map((e, t) => /* @__PURE__ */ i("li", {
					className: t === v ? "is-current" : void 0,
					onMouseEnter: () => h(t),
					onMouseDown: (t) => {
						t.preventDefault(), n(e.id);
					},
					children: [
						/* @__PURE__ */ r("span", {
							className: "cursor-mark",
							children: t === v ? "›" : " "
						}),
						e.swatch !== void 0 && /* @__PURE__ */ r("span", {
							className: "swatch",
							style: e.swatch ? { color: e.swatch } : void 0,
							children: e.swatch ? "■" : "□"
						}),
						/* @__PURE__ */ r("span", {
							className: "grow",
							children: e.label
						}),
						e.hotkey && /* @__PURE__ */ r("span", {
							className: "dim",
							children: e.hotkey
						})
					]
				}, e.id)), _.length === 0 && /* @__PURE__ */ r("li", {
					className: "dim",
					children: " no matches"
				})]
			})]
		})
	});
}, D = ({ groups: e, onClose: t, title: n = "help" }) => /* @__PURE__ */ r(T, {
	title: n,
	className: "help",
	footer: "esc / q to close",
	onClose: t,
	closeKeys: w,
	children: e.map((e) => /* @__PURE__ */ i("div", {
		className: "help-group",
		children: [/* @__PURE__ */ r("p", {
			className: "accent",
			children: e.title
		}), e.keys.map(([e, t]) => /* @__PURE__ */ i("p", {
			className: "help-line",
			children: [/* @__PURE__ */ r("span", {
				className: "help-key",
				children: e
			}), /* @__PURE__ */ r("span", {
				className: "dim",
				children: t
			})]
		}, e))]
	}, e.title))
}), O = (e) => ({
	kind: "choice",
	...e,
	onChange: (t) => e.onChange(t)
}), k = ({ title: e, fields: t, onSave: n, onCancel: o, error: l, note: u, focus: d, footer: f = "tab/↑↓ field · ←→ change · space toggle · enter save · esc cancel" }) => {
	let [p, m] = c(t[0]?.name ?? ""), h = s({}), [g, _] = c(d);
	d !== g && (_(d), d && m(d)), a(() => {
		h.current[p]?.focus();
	}, [p]);
	let v = Math.max(0, t.findIndex((e) => e.name === p)), y = t[v], b = (e) => {
		if (e.key === "Enter") e.preventDefault(), n();
		else if (e.key === "Tab" || e.key === "ArrowDown" || e.key === "ArrowUp") {
			e.preventDefault();
			let n = e.key === "ArrowUp" || e.key === "Tab" && e.shiftKey;
			m(t[(v + (n ? -1 : 1) + t.length) % t.length].name);
		} else if ([
			"ArrowLeft",
			"ArrowRight",
			"h",
			"l"
		].includes(e.key) && y.kind !== "text") {
			e.preventDefault();
			let t = e.key === "ArrowLeft" || e.key === "h" ? -1 : 1;
			y.kind === "toggle" ? y.onChange(!y.value) : y.onChange(A(y.options, y.value, t));
		} else e.key === " " && y.kind === "toggle" && (e.preventDefault(), y.onChange(!y.value));
	}, x = (e) => (t) => {
		h.current[e] = t;
	};
	return /* @__PURE__ */ i(T, {
		title: e,
		footer: f,
		onClose: o,
		onKeyDown: b,
		children: [
			t.map((e) => /* @__PURE__ */ i("div", {
				className: `form-row ${e.name === y.name ? "is-current" : ""}`,
				onMouseDown: () => m(e.name),
				children: [
					/* @__PURE__ */ r("span", {
						className: "cursor-mark",
						children: e.name === y.name ? "›" : " "
					}),
					/* @__PURE__ */ r("span", {
						className: "form-label",
						children: e.label
					}),
					/* @__PURE__ */ r("div", {
						className: "grow",
						children: e.kind === "text" ? /* @__PURE__ */ i("div", {
							className: "text-field",
							children: [/* @__PURE__ */ r("input", {
								ref: x(e.name),
								className: "prompt-input field-input",
								value: e.value,
								placeholder: e.placeholder,
								onChange: (t) => e.onChange(t.target.value),
								spellCheck: !1,
								"aria-label": e.label
							}), e.hint !== void 0 && /* @__PURE__ */ r("span", {
								className: "dim",
								children: e.hint
							})]
						}) : /* @__PURE__ */ r("div", {
							ref: x(e.name),
							tabIndex: -1,
							className: "choice",
							children: e.kind === "toggle" ? /* @__PURE__ */ r("span", {
								className: "option is-on",
								onMouseDown: () => e.onChange(!e.value),
								children: e.value ? `[x] ${e.on}` : `[ ] ${e.off}`
							}) : e.options.map((t, n) => /* @__PURE__ */ r("span", {
								className: `option ${Object.is(t.value, e.value) ? "is-on" : ""}`,
								style: t.color ? { color: t.color } : void 0,
								onMouseDown: () => e.onChange(t.value),
								children: t.label ?? (t.color ? "■" : String(t.value))
							}, n))
						})
					})
				]
			}, e.name)),
			u && /* @__PURE__ */ r("p", {
				className: "dim form-note",
				children: u
			}),
			l && /* @__PURE__ */ i("p", {
				className: "error form-note",
				children: ["E: ", l]
			})
		]
	});
}, A = (e, t, n) => e[(e.findIndex((e) => Object.is(e.value, t)) + n + e.length) % e.length].value, j = 1e3, M = /* @__PURE__ */ new Set([
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
	"PageUp",
	"PageDown",
	"Home",
	"End",
	"Tab",
	"S-Tab",
	"Enter",
	"Escape",
	"Space",
	"Backspace",
	"Delete"
]), N = /* @__PURE__ */ new Set([
	"Shift",
	"Control",
	"Alt",
	"Meta",
	"CapsLock"
]), P = (e) => e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey ? !0 : e.target instanceof Element && !!e.target.closest("input, textarea, [contenteditable], .overlay"), te = (e) => {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
	for (let [r, i] of Object.entries(e)) if (i) {
		for (let e of r.split(/\s+/).filter(Boolean)) if (t.set(e, i), !M.has(e)) for (let t = 1; t < e.length; t++) n.add(e.slice(0, t));
	}
	return {
		bindings: t,
		prefixes: n
	};
}, F = (e, { enabled: t = !0, onKey: n, onUnbound: r } = {}) => {
	let i = s({
		keymap: e,
		onKey: n,
		onUnbound: r
	});
	a(() => {
		i.current = {
			keymap: e,
			onKey: n,
			onUnbound: r
		};
	});
	let o = s(null);
	a(() => {
		if (!t) return;
		let e = (e) => {
			if (P(e) || N.has(e.key)) return;
			let { keymap: t, onKey: n, onUnbound: r } = i.current, { bindings: a, prefixes: s } = te(t), c = e.key === " " ? "Space" : e.key === "Tab" && e.shiftKey ? "S-Tab" : e.key, l = c.length === 1, u = o.current;
			o.current = null;
			let d = u && l && Date.now() - u.at < 1e3 ? u.seq : "";
			n?.(e);
			let f = [
				d + c,
				...d ? [c] : [],
				...c === "S-Tab" ? ["Tab"] : []
			];
			for (let t of f) {
				let n = a.get(t);
				if (n) {
					e.preventDefault(), n(e);
					return;
				}
				if (l && s.has(t)) {
					e.preventDefault(), o.current = {
						seq: t,
						at: Date.now()
					};
					return;
				}
			}
			r?.(e);
		};
		return globalThis.addEventListener("keydown", e), () => globalThis.removeEventListener("keydown", e);
	}, [t]);
}, I = ({ title: e, count: t, folded: n = !1, isCursor: a = !1, rowKey: o, onToggleFold: s, onAdd: c, addTitle: l, onMouseDown: u }) => {
	let d = z(a);
	return /* @__PURE__ */ i("div", {
		ref: d,
		"data-row": o,
		className: `row header ${a ? "is-cursor" : ""}`,
		onMouseDown: u,
		onClick: s,
		children: [
			/* @__PURE__ */ r("span", {
				className: "cursor-mark",
				children: a ? "›" : " "
			}),
			/* @__PURE__ */ r("span", {
				className: "fold",
				children: n ? "▸" : "▾"
			}),
			/* @__PURE__ */ r("span", {
				className: "section-title",
				children: e
			}),
			/* @__PURE__ */ r("span", { className: "rule" }),
			t !== void 0 && /* @__PURE__ */ r("span", {
				className: "dim",
				children: t
			}),
			c && /* @__PURE__ */ r("button", {
				type: "button",
				className: "add-button",
				title: l,
				onMouseDown: (e) => e.stopPropagation(),
				onClick: (e) => {
					e.stopPropagation(), c();
				},
				children: "[+]"
			})
		]
	});
}, L = ({ children: e, isCursor: t = !1, selected: n = !1, color: a, done: o, onToggleDone: s, tag: c, suffix: l, mark: u, dimText: d = !1, rowKey: f, onMouseDown: p, onDoubleClick: m }) => {
	let h = z(t);
	return /* @__PURE__ */ i("div", {
		ref: h,
		"data-row": f,
		className: `row item ${t ? "is-cursor" : ""} ${n ? "is-selected" : ""} ${o ? "is-done" : ""}`,
		onMouseDown: p,
		onDoubleClick: m,
		children: [
			/* @__PURE__ */ r("span", {
				className: "cursor-mark",
				children: t ? "›" : " "
			}),
			/* @__PURE__ */ r("span", {
				className: "select-mark",
				children: u ?? (n ? "●" : " ")
			}),
			/* @__PURE__ */ r("span", {
				className: "color-mark",
				style: a ? { color: a } : void 0,
				children: a ? "▌" : " "
			}),
			o === null ? /* @__PURE__ */ r("span", {
				className: "check is-static",
				children: " · "
			}) : o === void 0 ? null : /* @__PURE__ */ r("span", {
				className: "check",
				role: "checkbox",
				"aria-checked": o,
				onClick: (e) => {
					e.stopPropagation(), s?.();
				},
				children: o ? "[x]" : "[ ]"
			}),
			c !== void 0 && /* @__PURE__ */ r("span", {
				className: "tag",
				children: c
			}),
			/* @__PURE__ */ i("span", {
				className: `text ${d ? "dim" : ""}`,
				children: [e, l !== void 0 && /* @__PURE__ */ r("span", {
					className: "suffix",
					children: l
				})]
			})
		]
	});
}, R = ({ onSubmit: e, onClose: t, placeholder: n = "new item · enter adds · esc done", checkbox: a = !0 }) => {
	let [o, s] = c("");
	return /* @__PURE__ */ i("div", {
		className: "row item add-row",
		children: [
			/* @__PURE__ */ r("span", {
				className: "cursor-mark accent",
				children: "›"
			}),
			/* @__PURE__ */ r("span", {
				className: "select-mark",
				children: " "
			}),
			/* @__PURE__ */ r("span", {
				className: "color-mark",
				children: " "
			}),
			a && /* @__PURE__ */ r("span", {
				className: "check accent",
				children: "[ ]"
			}),
			/* @__PURE__ */ r("input", {
				autoFocus: !0,
				className: "prompt-input text",
				value: o,
				placeholder: n,
				spellCheck: !1,
				onChange: (e) => s(e.target.value),
				onBlur: t,
				onKeyDown: (n) => {
					n.key === "Enter" ? (n.preventDefault(), o.trim() && e(o.trim()), s("")) : n.key === "Escape" && (n.preventDefault(), t());
				},
				"aria-label": "New item"
			})
		]
	});
}, z = (e) => {
	let t = s(null);
	return o(() => {
		e && t.current?.scrollIntoView({ block: "nearest" });
	}, [e]), t;
}, B = /* @__PURE__ */ new Set(), V = (e) => `h:${e}`, H = (e) => `i:${e}`, U = (e) => e.items, W = (e, t, n = B) => e.flatMap((e) => [{
	key: V(e.key),
	kind: "header",
	section: e
}, ...n.has(e.key) ? [] : U(e).map((n) => ({
	key: H(t(n)),
	kind: "item",
	section: e,
	item: n
}))]), G = ({ sections: e, getKey: t, renderItem: a, folded: o = B, cursorKey: s = null, onToggleFold: c, onRowMouseDown: l, onOpenAdd: u, addingTo: d = null, onAdd: f, onCloseAdd: p, addPlaceholder: m, empty: h }) => /* @__PURE__ */ i("div", {
	className: "pane-scroll",
	children: [e.length === 0 && h, e.map((e) => {
		let h = o.has(e.key), g = {
			key: V(e.key),
			kind: "header",
			section: e
		}, _ = U(e).filter((t) => a(t, e).done === !0).length;
		return /* @__PURE__ */ i("div", {
			className: "section",
			children: [
				/* @__PURE__ */ r(I, {
					rowKey: g.key,
					title: e.title,
					folded: h,
					isCursor: s === g.key,
					count: e.count ?? /* @__PURE__ */ i(n, { children: [_ > 0 && /* @__PURE__ */ i("span", {
						className: "ok",
						children: [
							"✓",
							_,
							" "
						]
					}), e.items.length] }),
					onToggleFold: () => c?.(e.key),
					onAdd: e.canAdd && u ? () => u(e) : void 0,
					addTitle: typeof e.title == "string" ? `Add to ${e.title} (o)` : "Add (o)",
					onMouseDown: (e) => l?.(g, e)
				}),
				!h && U(e).map((n) => {
					let i = {
						key: H(t(n)),
						kind: "item",
						section: e,
						item: n
					};
					return /* @__PURE__ */ r(L, {
						rowKey: i.key,
						isCursor: s === i.key,
						onMouseDown: (e) => l?.(i, e),
						...a(n, e)
					}, i.key);
				}),
				d === e.key && f && /* @__PURE__ */ r(R, {
					placeholder: m,
					onSubmit: (t) => f(e, t),
					onClose: () => p?.()
				})
			]
		}, e.key);
	})]
}), K = (e) => {
	let [t, n] = c({
		key: null,
		index: 0
	}), r = t.key === null ? -1 : e.findIndex((e) => e.key === t.key), i = r === -1 ? Math.max(0, Math.min(t.index, e.length - 1)) : r, a = e[i], o = (t) => {
		let r = Math.max(0, Math.min(t, e.length - 1));
		n({
			key: e[r]?.key ?? null,
			index: r
		});
	};
	return {
		row: a,
		index: i,
		key: a?.key ?? null,
		moveTo: o,
		move: (e) => o(i + e),
		top: () => o(0),
		bottom: () => o(e.length - 1),
		setKey: (t) => {
			let r = e.findIndex((e) => e.key === t);
			n({
				key: t,
				index: r === -1 ? i : r
			});
		},
		jump: (t, n) => {
			for (let r = i + t; r >= 0 && r < e.length; r += t) if (n(e[r])) return o(r);
		}
	};
}, q = [], J = ({ banner: e, intro: t = q, onSignIn: n, userLabel: o = "login", userType: l = "email" }) => {
	let [u, d] = c("user"), [f, p] = c(""), [m, h] = c(""), [g, _] = c([]), v = s(null), y = s(null);
	a(() => {
		u === "user" && v.current?.focus(), u === "password" && y.current?.focus();
	}, [u]);
	let b = async () => {
		if (u === "user") {
			f.trim() && d("password");
			return;
		}
		if (u !== "password" || !m) return;
		d("busy");
		let e = await n(f.trim(), m);
		e && (_((t) => [
			...t,
			{
				id: t.length,
				text: `${o}: ${f.trim()}`
			},
			{
				id: t.length + 1,
				text: "password:"
			},
			{
				id: t.length + 2,
				text: `Login incorrect: ${e}`,
				kind: "error"
			},
			{
				id: t.length + 3,
				text: ""
			}
		]), h(""), d("password"));
	};
	return /* @__PURE__ */ i("div", {
		className: "login",
		onMouseUp: () => {
			globalThis.getSelection()?.toString() || (u === "user" ? v : y).current?.focus();
		},
		children: [
			e && /* @__PURE__ */ r("pre", {
				className: "login-banner",
				children: e
			}),
			t.map((e, t) => /* @__PURE__ */ r("p", {
				className: "dim",
				children: e
			}, t)),
			t.length > 0 && /* @__PURE__ */ r("br", {}),
			g.map((e) => /* @__PURE__ */ r("p", {
				className: e.kind,
				children: e.text || " "
			}, e.id)),
			/* @__PURE__ */ i("form", {
				onSubmit: (e) => {
					e.preventDefault(), b();
				},
				onKeyDown: (e) => {
					e.key === "Escape" && (h(""), d("user"));
				},
				children: [
					/* @__PURE__ */ i("label", {
						className: "prompt-line",
						children: [/* @__PURE__ */ i("span", { children: [o, ": "] }), /* @__PURE__ */ r("input", {
							ref: v,
							className: "prompt-input",
							type: l,
							name: l === "email" ? "email" : "username",
							autoComplete: "username",
							spellCheck: !1,
							value: f,
							readOnly: u !== "user",
							onChange: (e) => p(e.target.value),
							"aria-label": o
						})]
					}),
					u !== "user" && /* @__PURE__ */ i("label", {
						className: "prompt-line",
						children: [/* @__PURE__ */ r("span", { children: "password: " }), /* @__PURE__ */ r("input", {
							ref: y,
							className: "prompt-input",
							type: "password",
							name: "password",
							autoComplete: "current-password",
							value: m,
							readOnly: u === "busy",
							onChange: (e) => h(e.target.value),
							"aria-label": "Password"
						})]
					}),
					u === "busy" && /* @__PURE__ */ r("p", {
						className: "dim",
						children: "Authenticating…"
					}),
					/* @__PURE__ */ r("button", {
						type: "submit",
						hidden: !0
					})
				]
			})
		]
	});
}, Y = [
	["bg", "--bg"],
	["fg", "--fg"],
	["accent", "--accent"],
	["blue", "--blue"],
	["purple", "--purple"],
	["warn", "--warn"],
	["error", "--error"],
	["bgBar", "--bg-bar"],
	["bgCursor", "--bg-cursor"],
	["bgSelection", "--bg-selection"],
	["bgSearchMatch", "--bg-search-match"],
	["dim", "--dim"],
	["border", "--border"],
	["borderActive", "--border-active"],
	["backdrop", "--backdrop"],
	["font", "--font"]
], X = (e) => Y.flatMap(([t, n]) => {
	let r = e[t];
	return r ? [[n, r]] : [];
}), Z = (e) => Object.fromEntries(X(e)), ne = (e) => ({
	...Z(e),
	...e.scheme ? { colorScheme: e.scheme } : {}
}), Q = (e, t = document.documentElement) => {
	let n = X(e);
	for (let [e, r] of n) t.style.setProperty(e, r);
	e.scheme && (t.style.colorScheme = e.scheme);
	let r = t === document.documentElement ? document.querySelector("meta[name=\"theme-color\"]") : null, i = r?.getAttribute("content") ?? null;
	return r && r.setAttribute("content", getComputedStyle(t).getPropertyValue("--bg").trim()), () => {
		for (let [e] of n) t.style.removeProperty(e);
		e.scheme && (t.style.colorScheme = ""), r && i !== null && r.setAttribute("content", i);
	};
}, re = (e) => {
	let t = JSON.stringify(e);
	a(() => Q(e), [t]);
}, ie = {
	console: {
		bg: "#0d0f12",
		fg: "#c9d1d9",
		accent: "#7ee787",
		blue: "#79c0ff",
		purple: "#d2a8ff",
		warn: "#e3b341",
		error: "#ff7b72"
	},
	gruvbox: {
		bg: "#282828",
		fg: "#ebdbb2",
		accent: "#b8bb26",
		blue: "#83a598",
		purple: "#d3869b",
		warn: "#fabd2f",
		error: "#fb4934"
	},
	nord: {
		bg: "#2e3440",
		fg: "#d8dee9",
		accent: "#88c0d0",
		blue: "#81a1c1",
		purple: "#b48ead",
		warn: "#ebcb8b",
		error: "#bf616a"
	},
	dracula: {
		bg: "#282a36",
		fg: "#f8f8f2",
		accent: "#50fa7b",
		blue: "#8be9fd",
		purple: "#bd93f9",
		warn: "#f1fa8c",
		error: "#ff5555"
	},
	solarized: {
		bg: "#002b36",
		fg: "#93a1a1",
		accent: "#859900",
		blue: "#268bd2",
		purple: "#6c71c4",
		warn: "#b58900",
		error: "#dc322f"
	},
	amber: {
		bg: "#120c02",
		fg: "#ffb000",
		accent: "#ffcc66",
		blue: "#ffb000",
		purple: "#ffd68a",
		warn: "#ff8c00",
		error: "#ff5f40"
	},
	paper: {
		bg: "#fbfaf7",
		fg: "#2b2b2b",
		accent: "#1a7f37",
		blue: "#0550ae",
		purple: "#8250df",
		warn: "#9a6700",
		error: "#cf222e",
		backdrop: "rgb(0 0 0 / 0.25)",
		scheme: "light"
	}
}, ae = ({ children: e }) => /* @__PURE__ */ r("div", {
	className: "screen",
	children: e
}), oe = [], $ = ({ badge: e, tabs: t = oe, activeTab: n, onSelectTab: a, children: o }) => /* @__PURE__ */ i("header", {
	className: "topbar",
	children: [
		/* @__PURE__ */ r("span", {
			className: "badge",
			children: e
		}),
		t.map((e, t) => /* @__PURE__ */ i("button", {
			type: "button",
			className: `tab ${n === e.id ? "is-active" : ""}`,
			onClick: () => a?.(e.id),
			title: e.title ?? e.label,
			children: [
				t + 1,
				":",
				e.label,
				n === e.id ? "*" : " ",
				e.marker ?? ""
			]
		}, e.id)),
		/* @__PURE__ */ r("span", { className: "grow" }),
		o
	]
}), se = ({ hidden: e = !1, children: t }) => /* @__PURE__ */ r("div", {
	className: `tab-screen ${e ? "is-hidden" : ""}`,
	children: t
}), ce = ({ wide: e = !1, columns: t, className: n = "", children: i }) => /* @__PURE__ */ r("main", {
	className: `panes ${e ? "is-wide" : ""} ${n}`,
	style: t ? { "--pane-columns": t } : void 0,
	children: i
}), le = ({ children: e }) => /* @__PURE__ */ r("footer", {
	className: "statusbar",
	children: e
}), ue = ({ tone: e = "accent", children: t }) => /* @__PURE__ */ r("span", {
	className: `mode tone-${e}`,
	children: t
}), de = ({ onClick: e, title: t, children: n }) => /* @__PURE__ */ r("button", {
	type: "button",
	className: "link",
	onClick: e,
	title: t,
	children: n
});
export { R as AddRow, u as BottomLine, l as Box, _ as Clock, t as DEFAULT_HEADING_COLORS, T as Dialog, k as FormDialog, D as HelpDialog, L as ItemRow, de as LinkButton, J as LoginScreen, e as MarkdownPreview, ue as ModeBadge, C as Overlay, ce as Panes, E as Picker, j as SEQUENCE_TIMEOUT_MS, ae as Screen, I as SectionHeader, G as SectionList, le as StatusBar, se as TabScreen, $ as TopBar, Q as applyTheme, O as choiceField, m as fuzzyMatch, V as headerRowKey, P as isForeignKey, H as itemRowKey, W as listRows, p as plural, ne as themeStyle, Z as themeVariables, ie as themes, g as useClock, K as useCursor, x as useFolded, F as useKeymap, z as useScrollIntoView, S as useSelection, v as useStoredState, re as useTheme, h as useWideLayout, f as wordCompleter };

//# sourceMappingURL=index.js.map