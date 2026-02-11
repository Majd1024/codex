    (() => {
      // ---------- Helpers ----------
      const pad2 = (n) => String(n).padStart(2, "0");
      const toKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;

      const parseKey = (key) => {
        const [y,m,da] = key.split("-").map(Number);
        return new Date(y, m-1, da);
      };

      const sameDay = (a,b) =>
        a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();

      const fmtLong = (d) => d.toLocaleDateString(undefined, {
        weekday:"long", year:"numeric", month:"long", day:"numeric"
      });

      const monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
      ];

      // ISO weekday with Monday=1..Sunday=7
      const isoWeekday = (d) => {
        const w = d.getDay(); // 0 Sun..6 Sat
        return w === 0 ? 7 : w;
      };

      // ---------- Storage ----------
      const STORAGE_KEY = "calendar_events_v1";
      const loadAll = () => {
        try {
          return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch {
          return {};
        }
      };
      const saveAll = (obj) => localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));

      let eventsByDate = loadAll();

      // ---------- State ----------
      const today = new Date();
      let viewYear = today.getFullYear();
      let viewMonth = today.getMonth(); // 0-11

      let selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      let selectedKey = toKey(selectedDate);

      let editingId = null; // event id or null

      // ---------- Elements ----------
      const grid = document.getElementById("grid");
      const monthYearPill = document.getElementById("monthYearPill");
      const prevBtn = document.getElementById("prevBtn");
      const nextBtn = document.getElementById("nextBtn");
      const todayBtn = document.getElementById("todayBtn");

      const monthSelect = document.getElementById("monthSelect");
      const yearSelect = document.getElementById("yearSelect");

      const selectedTitle = document.getElementById("selectedTitle");
      const selectedSub = document.getElementById("selectedSub");
      const selectedKeyEl = document.getElementById("selectedKey");

      const eventForm = document.getElementById("eventForm");
      const titleInput = document.getElementById("titleInput");
      const timeInput = document.getElementById("timeInput");
      const categorySelect = document.getElementById("categorySelect");
      const notesInput = document.getElementById("notesInput");
      const saveBtn = document.getElementById("saveBtn");
      const cancelEditBtn = document.getElementById("cancelEditBtn");

      const eventList = document.getElementById("eventList");
      const dayFilter = document.getElementById("dayFilter");
      const clearDayFilterBtn = document.getElementById("clearDayFilterBtn");

      const globalSearch = document.getElementById("globalSearch");
      const clearSearchBtn = document.getElementById("clearSearchBtn");
      const searchResults = document.getElementById("searchResults");
      const srList = document.getElementById("srList");
      const srCount = document.getElementById("srCount");

      // ---------- Init dropdowns ----------
      function initMonthSelect(){
        monthSelect.innerHTML = "";
        monthNames.forEach((name, idx) => {
          const opt = document.createElement("option");
          opt.value = String(idx);
          opt.textContent = name;
          monthSelect.appendChild(opt);
        });
      }

      function initYearSelect(){
        const current = new Date().getFullYear();
        const start = current - 20;
        const end = current + 20;
        yearSelect.innerHTML = "";
        for(let y=start; y<=end; y++){
          const opt = document.createElement("option");
          opt.value = String(y);
          opt.textContent = String(y);
          yearSelect.appendChild(opt);
        }
      }

      // ---------- Calendar render ----------
      function getEventCount(key){
        const list = eventsByDate[key] || [];
        return list.length;
      }

      function renderCalendar(){
        monthYearPill.textContent = `${monthNames[viewMonth]} ${viewYear}`;
        monthSelect.value = String(viewMonth);
        yearSelect.value = String(viewYear);

        grid.innerHTML = "";

        // Start at first day of month
        const first = new Date(viewYear, viewMonth, 1);
        // Determine how many "previous month" days to show so grid starts Monday
        const offset = isoWeekday(first) - 1; // 0..6
        const startDate = new Date(viewYear, viewMonth, 1 - offset);

        // 6 rows * 7 cols = 42 tiles
        for(let i=0; i<42; i++){
          const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
          const key = toKey(d);

          const tile = document.createElement("button");
          tile.type = "button";
          tile.className = "day";
          tile.setAttribute("data-key", key);
          tile.setAttribute("aria-label", fmtLong(d));
          tile.tabIndex = 0;

          const num = document.createElement("div");
          num.className = "dayNum";
          num.textContent = d.getDate();
          tile.appendChild(num);

          const inCurrentMonth = (d.getMonth() === viewMonth);
          if(!inCurrentMonth) tile.classList.add("mutedDay");

          if (sameDay(d, today)) tile.classList.add("today");
          if (key === selectedKey) tile.classList.add("selected");

          const count = getEventCount(key);
          if(count > 0){
            const marker = document.createElement("div");
            marker.className = "marker";
            const dot = document.createElement("div");
            dot.className = "dot";
            marker.appendChild(dot);

            // show count badge if more than 1
            if(count > 1){
              const badge = document.createElement("div");
              badge.className = "count";
              badge.textContent = String(count);
              marker.appendChild(badge);
            }
            tile.appendChild(marker);
          }

          tile.addEventListener("click", () => {
            setSelectedDate(d);
          });

          grid.appendChild(tile);
        }
      }

      // ---------- Side panel render ----------
      function getEventsForSelected(){
        const list = (eventsByDate[selectedKey] || []).slice();

        // Sort: timed first by time, then no-time, stable by createdAt
        list.sort((a,b) => {
          const at = a.time || "";
          const bt = b.time || "";
          const aHas = !!a.time;
          const bHas = !!b.time;
          if (aHas && bHas) return at.localeCompare(bt);
          if (aHas && !bHas) return -1;
          if (!aHas && bHas) return 1;
          return (a.createdAt||0) - (b.createdAt||0);
        });

        return list;
      }

      function catClass(cat){
        const c = (cat||"Other").toLowerCase();
        if(c.includes("exam")) return "exam";
        if(c.includes("birth")) return "birthday";
        if(c.includes("meet")) return "meeting";
        if(c.includes("rem")) return "reminder";
        return "other";
      }

      function renderSide(){
        selectedKeyEl.textContent = selectedKey;
        selectedTitle.textContent = fmtLong(selectedDate);
        selectedSub.textContent = "Add exams, birthdays, meetings — anything.";

        const filter = (dayFilter.value || "").trim().toLowerCase();
        let list = getEventsForSelected();
        if(filter){
          list = list.filter(e => (e.title||"").toLowerCase().includes(filter));
        }

        eventList.innerHTML = "";

        if(list.length === 0){
          const empty = document.createElement("div");
          empty.className = "empty";
          empty.textContent = filter ? "No events match your filter." : "No events for this date yet. Add one above 👆";
          eventList.appendChild(empty);
          return;
        }

        list.forEach(ev => {
          const item = document.createElement("div");
          item.className = "item";

          const main = document.createElement("div");
          main.className = "itemMain";

          const t = document.createElement("div");
          t.className = "itemTitle";
          t.textContent = ev.title || "(Untitled)";
          main.appendChild(t);

          const meta = document.createElement("div");
          meta.className = "meta";

          if(ev.time){
            const timeBadge = document.createElement("span");
            timeBadge.className = "badge";
            timeBadge.textContent = ev.time;
            meta.appendChild(timeBadge);
          }

          const cat = document.createElement("span");
          cat.className = "badge " + catClass(ev.category);
          cat.textContent = ev.category || "Other";
          meta.appendChild(cat);

          main.appendChild(meta);

          if(ev.notes){
            const notes = document.createElement("div");
            notes.className = "notes";
            notes.textContent = ev.notes;
            main.appendChild(notes);
          }

          const actions = document.createElement("div");
          actions.className = "itemActions";

          const editBtn = document.createElement("button");
          editBtn.type = "button";
          editBtn.className = "btn mini";
          editBtn.textContent = "Edit";
          editBtn.addEventListener("click", () => startEdit(ev.id));
          actions.appendChild(editBtn);

          const delBtn = document.createElement("button");
          delBtn.type = "button";
          delBtn.className = "btn mini danger";
          delBtn.textContent = "Delete";
          delBtn.addEventListener("click", () => deleteEvent(ev.id));
          actions.appendChild(delBtn);

          item.appendChild(main);
          item.appendChild(actions);
          eventList.appendChild(item);
        });
      }

      // ---------- Selection ----------
      function setSelectedDate(d){
        selectedDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        selectedKey = toKey(selectedDate);

        // If selected date is outside current view, switch view to that month
        viewYear = selectedDate.getFullYear();
        viewMonth = selectedDate.getMonth();

        stopEdit();
        renderCalendar();
        renderSide();
      }

      // ---------- CRUD ----------
      function uid(){
        return Math.random().toString(16).slice(2) + Date.now().toString(16);
      }

      function upsertEvent(payload){
        const list = eventsByDate[selectedKey] || [];
        if(editingId){
          const idx = list.findIndex(e => e.id === editingId);
          if(idx !== -1){
            list[idx] = { ...list[idx], ...payload };
          }
        }else{
          list.push({
            id: uid(),
            title: payload.title,
            time: payload.time || "",
            category: payload.category || "Other",
            notes: payload.notes || "",
            createdAt: Date.now()
          });
        }
        eventsByDate[selectedKey] = list;
        saveAll(eventsByDate);
        renderCalendar(); // update markers
        renderSide();
      }

      function deleteEvent(id){
        const list = eventsByDate[selectedKey] || [];
        const next = list.filter(e => e.id !== id);
        if(next.length === 0){
          delete eventsByDate[selectedKey];
        }else{
          eventsByDate[selectedKey] = next;
        }
        saveAll(eventsByDate);

        // If we deleted the event we were editing, stop edit mode
        if(editingId === id) stopEdit();

        renderCalendar();
        renderSide();
      }

      function startEdit(id){
        const list = eventsByDate[selectedKey] || [];
        const ev = list.find(e => e.id === id);
        if(!ev) return;

        editingId = id;
        titleInput.value = ev.title || "";
        timeInput.value = ev.time || "";
        categorySelect.value = ev.category || "Other";
        notesInput.value = ev.notes || "";

        saveBtn.textContent = "Save changes";
        cancelEditBtn.style.display = "inline-flex";

        titleInput.focus();
      }

      function stopEdit(){
        editingId = null;
        eventForm.reset();
        categorySelect.value = "Other";
        saveBtn.textContent = "Add event";
        cancelEditBtn.style.display = "none";
      }

      // ---------- Global search ----------
      function collectAllEvents(){
        const out = [];
        for(const [dateKey, list] of Object.entries(eventsByDate)){
          for(const ev of list){
            out.push({ dateKey, ...ev });
          }
        }
        return out;
      }

      function renderGlobalSearch(){
        const q = (globalSearch.value || "").trim().toLowerCase();
        if(!q){
          searchResults.classList.remove("show");
          srList.innerHTML = "";
          srCount.textContent = "0 results";
          return;
        }

        const all = collectAllEvents();
        const matches = all.filter(ev => {
          const t = (ev.title || "").toLowerCase();
          const n = (ev.notes || "").toLowerCase();
          const c = (ev.category || "").toLowerCase();
          return t.includes(q) || n.includes(q) || c.includes(q);
        }).sort((a,b) => {
          // date ascending, then time
          if(a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
          const at = a.time || "99:99";
          const bt = b.time || "99:99";
          return at.localeCompare(bt);
        });

        srList.innerHTML = "";
        srCount.textContent = `${matches.length} result${matches.length===1?"":"s"}`;
        searchResults.classList.add("show");

        if(matches.length === 0){
          const div = document.createElement("div");
          div.className = "srItem";
          div.style.cursor = "default";
          div.textContent = "No matches.";
          srList.appendChild(div);
          return;
        }

        matches.slice(0, 50).forEach(ev => {
          const row = document.createElement("div");
          row.className = "srItem";
          row.addEventListener("click", () => {
            const d = parseKey(ev.dateKey);
            setSelectedDate(d);
            // optionally auto-open edit? no, just jump
            globalSearch.blur();
            searchResults.classList.remove("show");
          });

          const top = document.createElement("div");
          top.className = "srTop";

          const title = document.createElement("div");
          title.className = "srTitle";
          title.textContent = ev.title || "(Untitled)";

          const date = document.createElement("div");
          date.className = "srDate";
          date.textContent = ev.dateKey;

          top.appendChild(title);
          top.appendChild(date);

          const meta = document.createElement("div");
          meta.className = "srMeta";

          if(ev.time){
            const tb = document.createElement("span");
            tb.className = "badge";
            tb.textContent = ev.time;
            meta.appendChild(tb);
          }
          const cb = document.createElement("span");
          cb.className = "badge " + catClass(ev.category);
          cb.textContent = ev.category || "Other";
          meta.appendChild(cb);

          row.appendChild(top);
          row.appendChild(meta);
          srList.appendChild(row);
        });
      }

      // ---------- Navigation ----------
      function changeMonth(delta){
        const d = new Date(viewYear, viewMonth + delta, 1);
        viewYear = d.getFullYear();
        viewMonth = d.getMonth();
        renderCalendar();
      }

      // ---------- Keyboard navigation ----------
      function moveSelection(days){
        const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + days);
        setSelectedDate(d);
      }

      function onKeyDown(e){
        // Avoid hijacking typing in inputs
        const tag = (document.activeElement && document.activeElement.tagName) || "";
        const inForm = ["INPUT","TEXTAREA","SELECT"].includes(tag);
        if(inForm) return;

        if(e.key === "ArrowLeft"){ e.preventDefault(); moveSelection(-1); }
        else if(e.key === "ArrowRight"){ e.preventDefault(); moveSelection(1); }
        else if(e.key === "ArrowUp"){ e.preventDefault(); moveSelection(-7); }
        else if(e.key === "ArrowDown"){ e.preventDefault(); moveSelection(7); }
        else if(e.key === "Enter"){ e.preventDefault(); titleInput.focus(); }
      }

      // ---------- Events ----------
      prevBtn.addEventListener("click", () => changeMonth(-1));
      nextBtn.addEventListener("click", () => changeMonth(1));

      todayBtn.addEventListener("click", () => setSelectedDate(today));

      monthSelect.addEventListener("change", () => {
        viewMonth = Number(monthSelect.value);
        renderCalendar();
      });

      yearSelect.addEventListener("change", () => {
        viewYear = Number(yearSelect.value);
        renderCalendar();
      });

      eventForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = (titleInput.value || "").trim();
        if(!title){
          titleInput.focus();
          return;
        }
        const payload = {
          title,
          time: timeInput.value || "",
          category: categorySelect.value || "Other",
          notes: (notesInput.value || "").trim()
        };
        upsertEvent(payload);
        stopEdit();
        titleInput.focus();
      });

      cancelEditBtn.addEventListener("click", () => stopEdit());

      // Quick add: Enter in title adds if not editing notes/time
      titleInput.addEventListener("keydown", (e) => {
        if(e.key === "Enter"){
          e.preventDefault();
          saveBtn.click();
        }
      });

      dayFilter.addEventListener("input", () => renderSide());
      clearDayFilterBtn.addEventListener("click", () => {
        dayFilter.value = "";
        renderSide();
        dayFilter.focus();
      });

      globalSearch.addEventListener("input", renderGlobalSearch);
      clearSearchBtn.addEventListener("click", () => {
        globalSearch.value = "";
        renderGlobalSearch();
        globalSearch.focus();
      });

      document.addEventListener("keydown", onKeyDown);

      // ---------- Initial render ----------
      function syncSelectedHeader(){
        selectedKey = toKey(selectedDate);
        selectedKeyEl.textContent = selectedKey;
        selectedTitle.textContent = fmtLong(selectedDate);
      }

      initMonthSelect();
      initYearSelect();

      syncSelectedHeader();
      renderCalendar();
      renderSide();
      renderGlobalSearch();
    })();