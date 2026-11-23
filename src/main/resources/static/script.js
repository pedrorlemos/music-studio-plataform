/**
 * BASE 21 Studio - Painel de Agendamento do Estúdio
 * Script principal preparado para integração com Back-end.
 * - Dia atual calculado dinamicamente pelo relógio do sistema (new Date())
 * - Filtro de atividades em camada expansível (dropdown/popover)
 * - Divisões do calendário mensal com intervalo de dias (ex: Sem 1 | 02 - 08)
 * - Seleção de data direta em Mini Calendário + Campo de Descrição no modal
 * - Sala única: "Estúdio"
 */

const SINGLE_ROOM = 'Estúdio';

// Obtém a data real atual do sistema
const systemNow = new Date();
const YEAR = systemNow.getFullYear();

function formatIsoDate(year, monthIndex, day) {
    const m = String(monthIndex + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
}

const TODAY_ISO = formatIsoDate(YEAR, systemNow.getMonth(), systemNow.getDate());

const monthNamesShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const monthNamesFull = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const dayNamesShort = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const categoryMeta = {
    canto: { title: 'Aula de Canto', room: SINGLE_ROOM, color: '#ef4444' },
    guitarra: { title: 'Aula de Guitarra', room: SINGLE_ROOM, color: '#f97316' },
    violao: { title: 'Aula de Violão', room: SINGLE_ROOM, color: '#ec4899' },
    teclado: { title: 'Aula de Teclado', room: SINGLE_ROOM, color: '#06b6d4' },
    producao: { title: 'Produção Musical', room: SINGLE_ROOM, color: '#a855f7' },
    baixo: { title: 'Aula de Baixo', room: SINGLE_ROOM, color: '#22c55e' },
    ensaio: { title: 'Ensaio', room: SINGLE_ROOM, color: '#eab308' }
};

// Elementos do DOM
const weeklyMonthSelect = document.getElementById('weeklyMonthSelect');
const monthlyMonthSelect = document.getElementById('monthlyMonthSelect');
const monthlyFilterSelect = document.getElementById('monthlyFilterSelect');
const filterPills = document.querySelectorAll('#activityFilters .pill');
const filterDropdownContainer = document.getElementById('filterDropdownContainer');
const btnToggleFilter = document.getElementById('btnToggleFilter');
const filterDropdownPanel = document.getElementById('filterDropdownPanel');
const activeFilterLabel = document.getElementById('activeFilterLabel');
const activeFilterDot = document.getElementById('activeFilterDot');
const weekTabs = document.querySelectorAll('#weekNumberSelect .week-tab');
const weeklyGrid = document.getElementById('weeklyGrid');
const monthlyGridBody = document.getElementById('monthlyGridBody');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const legendItems = document.querySelectorAll('.legend-bar .legend-item');
const btnCreateBookingSection = document.getElementById('btnCreateBookingSection');

// Estado da Aplicação
let currentFilter = 'todos';
let currentMonth = systemNow.getMonth();
let currentWeek = 1;

// Cache da estrutura de calendário por mês (0..11) e agendamentos por data ISO (YYYY-MM-DD)
const schedulesByMonth = {};
const bookingsByIsoDate = {};

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function getEventsForIso(isoDate) {
    if (!bookingsByIsoDate[isoDate]) {
        bookingsByIsoDate[isoDate] = [];
    }
    return bookingsByIsoDate[isoDate];
}

/**
 * Gera a grade de 5 semanas (Segunda a Domingo) para qualquer mês do ano atual,
 * associando cada célula à sua data ISO real (YYYY-MM-DD).
 */
function generateMonthSchedule(monthIndex) {
    if (schedulesByMonth[monthIndex]) {
        return schedulesByMonth[monthIndex];
    }

    const firstDayOfMonth = new Date(YEAR, monthIndex, 1);
    const daysInMonth = new Date(YEAR, monthIndex + 1, 0).getDate();
    const daysInPrevMonth = new Date(YEAR, monthIndex, 0).getDate();

    // Converte dia da semana JS (0=Dom..6=Sab) para base Segunda (0=Seg..6=Dom)
    const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
    let currentDayCursor = startOffset === 6 ? 2 : 1 - startOffset;

    const weeksData = [];

    for (let w = 0; w < 5; w++) {
        const weekDays = [];
        for (let d = 0; d < 7; d++) {
            const isSunday = d === 6;
            let dateLabel = '';
            let dayNumber = 0;
            let cellMonthIdx = monthIndex;
            let cellYear = YEAR;
            let isMuted = false;

            if (currentDayCursor < 1) {
                const prevDay = daysInPrevMonth + currentDayCursor;
                cellMonthIdx = (monthIndex + 11) % 12;
                if (monthIndex === 0) cellYear = YEAR - 1;
                dayNumber = prevDay;
                dateLabel = `${String(prevDay).padStart(2, '0')} ${monthNamesShort[cellMonthIdx]}`;
                isMuted = true;
            } else if (currentDayCursor > daysInMonth) {
                const nextDay = currentDayCursor - daysInMonth;
                cellMonthIdx = (monthIndex + 1) % 12;
                if (monthIndex === 11) cellYear = YEAR + 1;
                dayNumber = nextDay;
                dateLabel = `${String(nextDay).padStart(2, '0')} ${monthNamesShort[cellMonthIdx]}`;
                isMuted = true;
            } else {
                dayNumber = currentDayCursor;
                dateLabel = String(currentDayCursor).padStart(2, '0');
            }

            const isoDate = formatIsoDate(cellYear, cellMonthIdx, dayNumber);

            weekDays.push({
                isoDate,
                dayNumber,
                monthIndex: cellMonthIdx,
                year: cellYear,
                dateLabel,
                isMuted,
                isSunday,
                isToday: isoDate === TODAY_ISO,
                get events() {
                    return getEventsForIso(isoDate);
                }
            });

            currentDayCursor++;
        }
        weeksData.push(weekDays);
    }

    schedulesByMonth[monthIndex] = weeksData;
    return weeksData;
}

/**
 * Localiza a semana (0..4) e dia (0..6) de uma data ISO dentro de seu mês.
 */
function findWeekAndDayByIso(isoDate) {
    const [, m] = isoDate.split('-').map(Number);
    const monthIdx = (m - 1 + 12) % 12;
    const weeks = generateMonthSchedule(monthIdx);

    for (let wIdx = 0; wIdx < weeks.length; wIdx++) {
        for (let dIdx = 0; dIdx < weeks[wIdx].length; dIdx++) {
            if (weeks[wIdx][dIdx].isoDate === isoDate && !weeks[wIdx][dIdx].isMuted) {
                return { monthIdx, weekIdx: wIdx, dayIdx: dIdx, dayObj: weeks[wIdx][dIdx] };
            }
        }
    }

    for (let wIdx = 0; wIdx < weeks.length; wIdx++) {
        for (let dIdx = 0; dIdx < weeks[wIdx].length; dIdx++) {
            if (weeks[wIdx][dIdx].isoDate === isoDate) {
                return { monthIdx, weekIdx: wIdx, dayIdx: dIdx, dayObj: weeks[wIdx][dIdx] };
            }
        }
    }

    return { monthIdx, weekIdx: 0, dayIdx: 0, dayObj: weeks[0][0] };
}

/**
 * Renderiza o corpo do Calendário Mensal (#monthlyGridBody) para o mês atual,
 * exibindo na coluna de semana o número da semana e o intervalo de início e fim (ex: Sem 1 | 02 - 08).
 */
function renderMonthlyGrid() {
    const weeksData = generateMonthSchedule(currentMonth);
    monthlyGridBody.innerHTML = '';

    weeksData.forEach((days, idx) => {
        const weekNum = idx + 1;
        const isHighlighted = weekNum === currentWeek;

        const row = document.createElement('div');
        row.className = `month-week-row${isHighlighted ? ' highlighted-week' : ''}`;
        row.dataset.weekRow = String(weekNum);

        const startDayLabel = days[0]?.dateLabel || '';
        const endDayLabel = days[6]?.dateLabel || '';

        // Indicador da Semana com intervalo de dias (ex: Sem 1 | 02 - 08)
        const indicator = document.createElement('div');
        indicator.className = 'week-indicator';
        indicator.innerHTML = `
            <span class="week-num">Sem ${weekNum}</span>
            <span class="week-range">${startDayLabel} - ${endDayLabel}</span>
        `;
        row.appendChild(indicator);

        // 7 Células de Dias
        days.forEach((dayObj, dayIdx) => {
            const cell = document.createElement('div');
            const classes = ['month-day-cell'];
            if (dayObj.isSunday) classes.push('is-sunday');
            if (dayObj.isMuted) classes.push('is-muted');
            if (dayObj.isToday) classes.push('is-today');
            cell.className = classes.join(' ');
            cell.dataset.weekIndex = String(idx);
            cell.dataset.dayIndex = String(dayIdx);
            cell.dataset.isoDate = dayObj.isoDate;

            const dateSpan = document.createElement('span');
            dateSpan.className = 'cell-date';
            dateSpan.textContent = dayObj.dateLabel;
            cell.appendChild(dateSpan);

            const eventsContainer = document.createElement('div');
            eventsContainer.className = 'cell-events';

            dayObj.events.forEach((ev, evIdx) => {
                const isFilteredOut = currentFilter !== 'todos' && currentFilter !== ev.category;
                const mini = document.createElement('div');
                mini.className = `mini-event cat-${ev.category}${isFilteredOut ? ' is-filtered-out' : ''}`;
                mini.dataset.category = ev.category;
                mini.dataset.isoDate = dayObj.isoDate;
                mini.dataset.eventIndex = String(evIdx);
                if (ev.description) {
                    mini.title = ev.description;
                }
                const miniDescHtml = ev.description
                    ? `<span class="mini-desc">${escapeHtml(ev.description)}</span>`
                    : '';
                mini.innerHTML = `
                    <span class="mini-time">${escapeHtml(ev.time)}</span>
                    <span class="mini-name">${escapeHtml(ev.title)}</span>
                    ${miniDescHtml}
                `;
                eventsContainer.appendChild(mini);
            });

            cell.appendChild(eventsContainer);
            row.appendChild(cell);
        });

        monthlyGridBody.appendChild(row);
    });
}

/**
 * Sincroniza e renderiza o Calendário Semanal em Destaque (#weeklyGrid)
 * com base na semana selecionada.
 */
function syncWeeklyFromMonthRow(weekNumber) {
    currentWeek = Number(weekNumber);

    // Atualiza abas de semana
    weekTabs.forEach(tab => {
        tab.classList.toggle('active', Number(tab.dataset.week) === currentWeek);
    });

    // Atualiza destaque nas linhas do calendário mensal
    const weekRows = monthlyGridBody.querySelectorAll('.month-week-row');
    weekRows.forEach(row => {
        const isTarget = Number(row.dataset.weekRow) === currentWeek;
        row.classList.toggle('highlighted-week', isTarget);
    });

    const weeksData = generateMonthSchedule(currentMonth);
    const targetDays = weeksData[currentWeek - 1];
    if (!targetDays) return;

    weeklyGrid.innerHTML = '';

    targetDays.forEach((dayObj, dayIdx) => {
        const rawDate = dayObj.dateLabel;
        const dateLabel = rawDate.includes(' ')
            ? rawDate
            : `${rawDate} ${monthNamesShort[currentMonth]}`;

        const visibleEvents = dayObj.events.filter(
            ev => currentFilter === 'todos' || ev.category === currentFilter
        );

        const colClasses = ['week-day-column'];
        if (dayObj.isToday) colClasses.push('is-today');
        if (dayObj.events.length > 0 && visibleEvents.length > 0) {
            colClasses.push('has-events');
        } else {
            colClasses.push('empty-day');
        }

        const col = document.createElement('div');
        col.className = colClasses.join(' ');
        col.dataset.isoDate = dayObj.isoDate;

        let eventsHtml = '';
        dayObj.events.forEach((ev, evIdx) => {
            const hiddenClass = (currentFilter !== 'todos' && currentFilter !== ev.category)
                ? 'is-filtered-out'
                : '';

            const descHtml = ev.description
                ? `<p class="event-desc">${escapeHtml(ev.description)}</p>`
                : '';

            eventsHtml += `
                <div class="event-square cat-${ev.category} ${hiddenClass}"
                     data-category="${ev.category}"
                     data-iso-date="${dayObj.isoDate}"
                     data-event-index="${evIdx}">
                    <span class="event-time">${escapeHtml(ev.time)}</span>
                    <strong class="event-title">${escapeHtml(ev.title)}</strong>
                    <span class="event-room">${SINGLE_ROOM}</span>
                    ${descHtml}
                </div>
            `;
        });

        if (dayObj.events.length === 0) {
            eventsHtml = `<div class="empty-slot-msg" data-add-slot="true">Livre para agendamento</div>`;
        } else if (visibleEvents.length === 0) {
            eventsHtml += `<div class="empty-slot-msg" data-add-slot="true">Sem horários para este filtro</div>`;
        }

        eventsHtml += `
            <button type="button" class="btn-day-add" data-add-iso="${dayObj.isoDate}">
                + Agendar
            </button>
        `;

        const todayBadgeHtml = dayObj.isToday ? ' <small class="today-badge">Hoje</small>' : '';

        col.innerHTML = `
            <div class="week-day-header">
                <span class="day-name">${dayNames[dayIdx]}${todayBadgeHtml}</span>
                <span class="day-number">${dateLabel}</span>
            </div>
            <div class="week-day-events">
                ${eventsHtml}
            </div>
        `;

        weeklyGrid.appendChild(col);
    });
}

/**
 * Abre/fecha o painel de filtros em camada no topo
 */
function toggleFilterDropdown(forceOpen) {
    if (!filterDropdownPanel || !btnToggleFilter) return;
    const isCurrentlyHidden = filterDropdownPanel.hasAttribute('hidden');
    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : isCurrentlyHidden;

    if (shouldOpen) {
        filterDropdownPanel.removeAttribute('hidden');
        btnToggleFilter.setAttribute('aria-expanded', 'true');
    } else {
        filterDropdownPanel.setAttribute('hidden', '');
        btnToggleFilter.setAttribute('aria-expanded', 'false');
    }
}

/**
 * Aplica filtro de modalidade/atividade tanto na visão semanal quanto na mensal.
 */
function applyActivityFilter(filterValue) {
    currentFilter = filterValue;

    filterPills.forEach(pill => {
        pill.classList.toggle('active', pill.dataset.filter === currentFilter);
    });

    if (monthlyFilterSelect && monthlyFilterSelect.value !== currentFilter) {
        monthlyFilterSelect.value = currentFilter;
    }

    if (activeFilterLabel) {
        activeFilterLabel.textContent = currentFilter === 'todos'
            ? 'Todos'
            : (categoryMeta[currentFilter]?.title || 'Todos');
    }

    if (activeFilterDot) {
        activeFilterDot.style.background = currentFilter === 'todos'
            ? '#22c55e'
            : (categoryMeta[currentFilter]?.color || '#22c55e');
    }

    legendItems.forEach(item => {
        const dot = item.querySelector('.dot');
        const matchCat = Array.from(dot?.classList || [])
            .find(c => c.startsWith('cat-'))
            ?.replace('cat-', '');
        item.classList.toggle('active-legend', currentFilter !== 'todos' && matchCat === currentFilter);
    });

    monthlyGridBody.querySelectorAll('.mini-event').forEach(el => {
        const match = currentFilter === 'todos' || el.dataset.category === currentFilter;
        el.classList.toggle('is-filtered-out', !match);
    });

    syncWeeklyFromMonthRow(currentWeek);
}

/**
 * Atualiza o mês selecionado em ambos os seletores e re-renderiza os calendários.
 */
function updateMonth(monthIndex) {
    currentMonth = (Number(monthIndex) + 12) % 12;
    weeklyMonthSelect.value = String(currentMonth);
    monthlyMonthSelect.value = String(currentMonth);

    renderMonthlyGrid();
    syncWeeklyFromMonthRow(currentWeek);
}

/* ==========================================================================
   Modal de Agendamento com Mini Calendário & Campo de Descrição
   ========================================================================== */

let modalBackdrop = null;
let toastElement = null;
let toastTimer = null;

function showToast(message) {
    if (!toastElement) {
        toastElement = document.createElement('div');
        toastElement.className = 'studio-toast';
        document.body.appendChild(toastElement);
    }
    toastElement.textContent = message;
    toastElement.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toastElement.classList.remove('is-visible');
    }, 3000);
}

function parseTimeRangeMinutes(timeStr) {
    const parts = String(timeStr).split('-').map(s => s.trim());
    if (parts.length !== 2) return null;
    const toMin = (hhmm) => {
        const [h, m] = hhmm.split(':').map(Number);
        if (Number.isNaN(h) || Number.isNaN(m)) return null;
        return h * 60 + m;
    };
    const start = toMin(parts[0]);
    const end = toMin(parts[1]);
    if (start === null || end === null) return null;
    return { start, end, startStr: parts[0], endStr: parts[1] };
}

function sortDayEvents(eventsList) {
    eventsList.sort((a, b) => {
        const rangeA = parseTimeRangeMinutes(a.time);
        const rangeB = parseTimeRangeMinutes(b.time);
        return (rangeA?.start ?? 0) - (rangeB?.start ?? 0);
    });
}

function findConflictingEvent(eventsList, startMin, endMin, ignoreIdx = -1) {
    for (let i = 0; i < eventsList.length; i++) {
        if (i === ignoreIdx) continue;
        const parsed = parseTimeRangeMinutes(eventsList[i].time);
        if (!parsed) continue;
        if (startMin < parsed.end && endMin > parsed.start) {
            return eventsList[i];
        }
    }
    return null;
}

function formatHumanDateFromIso(isoDate) {
    const [y, m, d] = isoDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayOfWeekIdx = (dateObj.getDay() + 6) % 7;
    const dayStr = String(d).padStart(2, '0');
    return `${dayNames[dayOfWeekIdx]}, ${dayStr} de ${monthNamesFull[m - 1]} de ${y}`;
}

function ensureModalExists() {
    if (modalBackdrop) return modalBackdrop;

    modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'studio-modal-backdrop';
    modalBackdrop.innerHTML = `
        <div class="studio-modal" role="dialog" aria-modal="true" aria-labelledby="studioModalTitle">
            <div class="studio-modal-header">
                <h3 id="studioModalTitle">Detalhes do Agendamento</h3>
                <button type="button" class="studio-modal-close" aria-label="Fechar">&times;</button>
            </div>
            <div class="studio-modal-body" id="studioModalBody"></div>
        </div>
    `;

    document.body.appendChild(modalBackdrop);

    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop || e.target.closest('.studio-modal-close')) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalBackdrop.classList.contains('is-open')) {
            closeModal();
        }
    });

    return modalBackdrop;
}

function closeModal() {
    if (modalBackdrop) {
        modalBackdrop.classList.remove('is-open');
    }
}

function openEventDetailsModal(isoDate, eventIdx) {
    const events = getEventsForIso(isoDate);
    const ev = events[eventIdx];
    if (!ev) return;

    const modal = ensureModalExists();
    const titleEl = modal.querySelector('#studioModalTitle');
    const bodyEl = modal.querySelector('#studioModalBody');

    const descBlockHtml = ev.description
        ? `
        <div class="modal-detail-desc">
            <span class="modal-detail-label">Descrição</span>
            <p>${escapeHtml(ev.description)}</p>
        </div>`
        : '';

    titleEl.textContent = ev.title;
    bodyEl.innerHTML = `
        <div class="modal-detail-row">
            <span class="modal-detail-label">Data</span>
            <span class="modal-detail-value">${formatHumanDateFromIso(isoDate)}</span>
        </div>
        <div class="modal-detail-row">
            <span class="modal-detail-label">Horário</span>
            <span class="modal-detail-value">${escapeHtml(ev.time)}</span>
        </div>
        <div class="modal-detail-row">
            <span class="modal-detail-label">Sala</span>
            <span class="modal-detail-value">${SINGLE_ROOM}</span>
        </div>
        ${descBlockHtml}
        <div class="modal-actions">
            <button type="button" class="btn-modal btn-modal-danger" id="btnRemoveBooking">Cancelar Horário</button>
            <button type="button" class="btn-modal" id="btnEditBooking">Editar</button>
            <button type="button" class="btn-modal btn-modal-primary" id="btnNewInDay">+ Novo neste dia</button>
        </div>
    `;

    bodyEl.querySelector('#btnRemoveBooking').addEventListener('click', () => {
        const removed = events.splice(eventIdx, 1)[0];
        renderMonthlyGrid();
        syncWeeklyFromMonthRow(currentWeek);
        closeModal();
        showToast('Agendamento cancelado.');
        window.dispatchEvent(new CustomEvent('studio:booking-deleted', {
            detail: { isoDate, booking: removed }
        }));
    });

    bodyEl.querySelector('#btnEditBooking').addEventListener('click', () => {
        openNewBookingModal(isoDate, eventIdx);
    });

    bodyEl.querySelector('#btnNewInDay').addEventListener('click', () => {
        openNewBookingModal(isoDate);
    });

    modal.classList.add('is-open');
}

/**
 * Abre o modal de Criar/Editar Agendamento com um Mini Calendário interativo
 * e campo para inserir uma Descrição.
 */
function openNewBookingModal(initialIsoDate = null, editEventIdx = null) {
    let selectedIso = initialIsoDate;
    if (!selectedIso) {
        const currentWeeks = generateMonthSchedule(currentMonth);
        const activeWeek = currentWeeks[currentWeek - 1] || currentWeeks[0];
        const todayInWeek = activeWeek.find(d => d.isToday);
        selectedIso = (todayInWeek || activeWeek[0]).isoDate;
    }

    const [, initMonthNum] = selectedIso.split('-').map(Number);
    let pickerMonth = (initMonthNum - 1 + 12) % 12;

    const existingEvents = getEventsForIso(selectedIso);
    const isEditing = editEventIdx !== null && Boolean(existingEvents[editEventIdx]);
    const existingEv = isEditing ? existingEvents[editEventIdx] : null;
    const parsedTime = existingEv ? parseTimeRangeMinutes(existingEv.time) : null;

    const defaultCat = existingEv
        ? existingEv.category
        : (currentFilter !== 'todos' ? currentFilter : 'ensaio');
    const defaultStart = parsedTime ? parsedTime.startStr : '18:00';
    const defaultEnd = parsedTime ? parsedTime.endStr : '20:00';
    const defaultDesc = existingEv?.description || '';

    const modal = ensureModalExists();
    const titleEl = modal.querySelector('#studioModalTitle');
    const bodyEl = modal.querySelector('#studioModalBody');

    titleEl.textContent = isEditing ? 'Editar Agendamento' : 'Criar Agendamento';

    const weekdaysHeaderHtml = dayNamesShort.map(d => `<span>${d}</span>`).join('');

    bodyEl.innerHTML = `
        <form id="newBookingForm" class="studio-modal-body">
            <div class="modal-form-group">
                <label>Selecione a Data no Mini Calendário</label>
                <div class="mini-calendar" id="modalMiniCalendar">
                    <div class="mini-cal-header">
                        <button type="button" class="mini-cal-nav" id="miniCalPrevMonth" title="Mês anterior">&#8592;</button>
                        <span class="mini-cal-title" id="miniCalMonthTitle"></span>
                        <button type="button" class="mini-cal-nav" id="miniCalNextMonth" title="Próximo mês">&#8594;</button>
                    </div>
                    <div class="mini-cal-weekdays">${weekdaysHeaderHtml}</div>
                    <div class="mini-cal-grid" id="miniCalDaysGrid"></div>
                    <div class="mini-cal-selected-banner" id="miniCalSelectedBanner"></div>
                </div>
            </div>

            <div class="modal-form-group">
                <label for="bookingCategory">Modalidade</label>
                <select id="bookingCategory" class="modal-input">
                    <option value="canto" ${defaultCat === 'canto' ? 'selected' : ''}>Aula de Canto</option>
                    <option value="guitarra" ${defaultCat === 'guitarra' ? 'selected' : ''}>Aula de Guitarra</option>
                    <option value="violao" ${defaultCat === 'violao' ? 'selected' : ''}>Aula de Violão</option>
                    <option value="teclado" ${defaultCat === 'teclado' ? 'selected' : ''}>Aula de Teclado</option>
                    <option value="producao" ${defaultCat === 'producao' ? 'selected' : ''}>Produção Musical</option>
                    <option value="baixo" ${defaultCat === 'baixo' ? 'selected' : ''}>Aula de Baixo</option>
                    <option value="ensaio" ${defaultCat === 'ensaio' ? 'selected' : ''}>Ensaio</option>
                </select>
            </div>

            <div class="modal-time-row">
                <div class="modal-form-group">
                    <label for="bookingStartTime">Início</label>
                    <input type="time" id="bookingStartTime" class="modal-input" value="${defaultStart}" required />
                </div>
                <div class="modal-form-group">
                    <label for="bookingEndTime">Término</label>
                    <input type="time" id="bookingEndTime" class="modal-input" value="${defaultEnd}" required />
                </div>
            </div>

            <div class="modal-form-group">
                <label for="bookingDescription">Descrição</label>
                <textarea id="bookingDescription" class="modal-input modal-textarea" rows="3" placeholder="Insira uma descrição (ex: nome do aluno/banda, equipamento, observações)...">${escapeHtml(defaultDesc)}</textarea>
            </div>

            <div class="modal-form-group">
                <label for="bookingRoom">Sala</label>
                <select id="bookingRoom" class="modal-input">
                    <option value="${SINGLE_ROOM}" selected>${SINGLE_ROOM}</option>
                </select>
            </div>

            <div class="modal-error-msg" id="bookingErrorMsg"></div>

            <div class="modal-actions">
                <button type="button" class="btn-modal" id="btnCancelModal">Cancelar</button>
                <button type="submit" class="btn-modal btn-modal-primary">
                    ${isEditing ? 'Salvar Alterações' : 'Confirmar Agendamento'}
                </button>
            </div>
        </form>
    `;

    const miniCalTitle = bodyEl.querySelector('#miniCalMonthTitle');
    const miniCalGrid = bodyEl.querySelector('#miniCalDaysGrid');
    const miniCalBanner = bodyEl.querySelector('#miniCalSelectedBanner');
    const prevBtn = bodyEl.querySelector('#miniCalPrevMonth');
    const nextBtn = bodyEl.querySelector('#miniCalNextMonth');
    const catSelect = bodyEl.querySelector('#bookingCategory');
    const startInput = bodyEl.querySelector('#bookingStartTime');
    const endInput = bodyEl.querySelector('#bookingEndTime');
    const descInput = bodyEl.querySelector('#bookingDescription');
    const errorMsgEl = bodyEl.querySelector('#bookingErrorMsg');

    function renderMiniCalendar() {
        const monthWeeks = generateMonthSchedule(pickerMonth);
        miniCalTitle.textContent = `${monthNamesFull[pickerMonth]} ${YEAR}`;
        miniCalGrid.innerHTML = '';

        monthWeeks.forEach((weekDays) => {
            weekDays.forEach((dayObj) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                const classes = ['mini-cal-day'];

                if (dayObj.isMuted) classes.push('is-muted');
                if (dayObj.isToday) classes.push('is-today');
                if (dayObj.events.length > 0) classes.push('has-booking');
                if (dayObj.isoDate === selectedIso) classes.push('is-selected');

                btn.className = classes.join(' ');
                btn.textContent = String(dayObj.dayNumber).padStart(2, '0');

                btn.addEventListener('click', () => {
                    selectedIso = dayObj.isoDate;
                    if (dayObj.isMuted && dayObj.year === YEAR) {
                        pickerMonth = dayObj.monthIndex;
                    }
                    errorMsgEl.classList.remove('is-visible');
                    renderMiniCalendar();
                });

                miniCalGrid.appendChild(btn);
            });
        });

        miniCalBanner.textContent = `Data selecionada: ${formatHumanDateFromIso(selectedIso)}`;
    }

    prevBtn.addEventListener('click', () => {
        pickerMonth = (pickerMonth + 11) % 12;
        renderMiniCalendar();
    });

    nextBtn.addEventListener('click', () => {
        pickerMonth = (pickerMonth + 1) % 12;
        renderMiniCalendar();
    });

    renderMiniCalendar();

    bodyEl.querySelector('#btnCancelModal').addEventListener('click', closeModal);

    bodyEl.querySelector('#newBookingForm').addEventListener('submit', (e) => {
        e.preventDefault();
        errorMsgEl.classList.remove('is-visible');

        const cat = catSelect.value;
        const startVal = startInput.value.trim();
        const endVal = endInput.value.trim();
        const description = descInput.value.trim();
        const formattedTime = `${startVal} - ${endVal}`;

        const parsed = parseTimeRangeMinutes(formattedTime);
        if (!parsed || parsed.end <= parsed.start) {
            errorMsgEl.textContent = 'O horário de término deve ser maior que o horário de início.';
            errorMsgEl.classList.add('is-visible');
            return;
        }

        const targetEvents = getEventsForIso(selectedIso);
        const ignoreIdx = (isEditing && selectedIso === initialIsoDate) ? editEventIdx : -1;

        const conflict = findConflictingEvent(targetEvents, parsed.start, parsed.end, ignoreIdx);
        if (conflict) {
            errorMsgEl.textContent = `Conflito no ${SINGLE_ROOM}: já existe "${conflict.title}" das ${conflict.time}.`;
            errorMsgEl.classList.add('is-visible');
            return;
        }

        const bookingData = {
            isoDate: selectedIso,
            category: cat,
            time: formattedTime,
            title: categoryMeta[cat]?.title || 'Atividade',
            description,
            room: SINGLE_ROOM
        };

        if (isEditing) {
            if (selectedIso === initialIsoDate) {
                targetEvents[editEventIdx] = bookingData;
            } else {
                existingEvents.splice(editEventIdx, 1);
                targetEvents.push(bookingData);
            }
        } else {
            targetEvents.push(bookingData);
        }

        sortDayEvents(targetEvents);

        // Sincroniza o calendário principal com a data escolhida no mini calendário
        const located = findWeekAndDayByIso(selectedIso);
        currentMonth = located.monthIdx;
        weeklyMonthSelect.value = String(currentMonth);
        monthlyMonthSelect.value = String(currentMonth);

        renderMonthlyGrid();
        syncWeeklyFromMonthRow(located.weekIdx + 1);
        closeModal();
        showToast(isEditing ? 'Agendamento atualizado!' : 'Agendamento criado no Estúdio!');

        window.dispatchEvent(new CustomEvent(
            isEditing ? 'studio:booking-updated' : 'studio:booking-created',
            { detail: bookingData }
        ));
    });

    modal.classList.add('is-open');
}

/* ==========================================================================
   API Pública para Integração com Back-end (window.StudioScheduleAPI)
   ========================================================================== */

window.StudioScheduleAPI = {
    clearBookings() {
        Object.keys(bookingsByIsoDate).forEach(k => {
            bookingsByIsoDate[k] = [];
        });
        renderMonthlyGrid();
        syncWeeklyFromMonthRow(currentWeek);
    },

    getBookings() {
        return JSON.parse(JSON.stringify(bookingsByIsoDate));
    },

    setBookings(bookingsList = []) {
        Object.keys(bookingsByIsoDate).forEach(k => {
            bookingsByIsoDate[k] = [];
        });
        bookingsList.forEach(item => this.addBooking(item));
    },

    addBooking({ isoDate, monthIndex, dayNumber, category, time, title, description = '' }) {
        const targetIso = isoDate || formatIsoDate(YEAR, Number(monthIndex), Number(dayNumber));
        const list = getEventsForIso(targetIso);
        list.push({
            isoDate: targetIso,
            category,
            time,
            title: title || categoryMeta[category]?.title || 'Atividade',
            description,
            room: SINGLE_ROOM
        });
        sortDayEvents(list);
        renderMonthlyGrid();
        syncWeeklyFromMonthRow(currentWeek);
        return true;
    }
};

/* ==========================================================================
   Event Listeners & Inicialização
   ========================================================================== */

if (btnCreateBookingSection) {
    btnCreateBookingSection.addEventListener('click', () => {
        openNewBookingModal();
    });
}

// Botão de abrir/fechar camada de filtros no cabeçalho
if (btnToggleFilter) {
    btnToggleFilter.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFilterDropdown();
    });
}

document.addEventListener('click', (e) => {
    if (filterDropdownContainer && !filterDropdownContainer.contains(e.target)) {
        toggleFilterDropdown(false);
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        toggleFilterDropdown(false);
    }
});

// Abas da Semana (Semana 1 .. Semana 5)
weekTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        syncWeeklyFromMonthRow(tab.dataset.week);
    });
});

// Clique no Calendário Mensal (linha da semana ou mini-evento)
monthlyGridBody.addEventListener('click', (e) => {
    const miniEvent = e.target.closest('.mini-event');
    if (miniEvent) {
        e.stopPropagation();
        openEventDetailsModal(
            miniEvent.dataset.isoDate,
            Number(miniEvent.dataset.eventIndex)
        );
        return;
    }

    const weekRow = e.target.closest('.month-week-row');
    if (weekRow) {
        syncWeeklyFromMonthRow(weekRow.dataset.weekRow);
    }
});

// Clique no Calendário Semanal (card de evento, botão + Agendar ou slot livre)
weeklyGrid.addEventListener('click', (e) => {
    const eventSquare = e.target.closest('.event-square');
    if (eventSquare) {
        openEventDetailsModal(
            eventSquare.dataset.isoDate,
            Number(eventSquare.dataset.eventIndex)
        );
        return;
    }

    const dayCol = e.target.closest('.week-day-column');
    if (dayCol && (e.target.closest('.btn-day-add') || e.target.closest('.empty-slot-msg') || e.target.closest('.week-day-header'))) {
        openNewBookingModal(dayCol.dataset.isoDate);
    }
});

// Pílulas de Filtro dentro do Painel Expansível
filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
        applyActivityFilter(pill.dataset.filter);
        toggleFilterDropdown(false);
    });
});

// Clique nos itens da legenda de cores para filtrar rapidamente
legendItems.forEach(item => {
    item.addEventListener('click', () => {
        const dot = item.querySelector('.dot');
        const cat = Array.from(dot?.classList || [])
            .find(c => c.startsWith('cat-'))
            ?.replace('cat-', '');
        if (!cat) return;
        const nextFilter = currentFilter === cat ? 'todos' : cat;
        applyActivityFilter(nextFilter);
    });
});

// Seletores de Filtro e de Mês
monthlyFilterSelect.addEventListener('change', (e) => applyActivityFilter(e.target.value));
weeklyMonthSelect.addEventListener('change', (e) => updateMonth(e.target.value));
monthlyMonthSelect.addEventListener('change', (e) => updateMonth(e.target.value));
prevMonthBtn.addEventListener('click', () => updateMonth(currentMonth - 1));
nextMonthBtn.addEventListener('click', () => updateMonth(currentMonth + 1));

// Inicialização posicionada automaticamente no mês e semana do dia atual real (TODAY_ISO)
const todayLocation = findWeekAndDayByIso(TODAY_ISO);
currentMonth = todayLocation.monthIdx;
currentWeek = todayLocation.weekIdx + 1;
weeklyMonthSelect.value = String(currentMonth);
monthlyMonthSelect.value = String(currentMonth);

renderMonthlyGrid();
syncWeeklyFromMonthRow(currentWeek);
