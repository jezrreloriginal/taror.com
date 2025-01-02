document.addEventListener('DOMContentLoaded', () => {
    const adminCalendar = document.getElementById('adminCalendar');
    const daySettings = document.getElementById('daySettings');
    const selectedDateDisplay = document.getElementById('selectedDate');
    const activateDateBtn = document.getElementById('activateDate');
    const timeManagement = document.getElementById('timeManagement');
    const addDefaultTimesBtn = document.getElementById('addDefaultTimes');
    const customTimeInput = document.getElementById('customTimeInput');
    const addCustomTimeBtn = document.getElementById('addCustomTime');
    const timeList = document.getElementById('timeList');

    let activeDays = [];
    let timesPerDay = {};

    // Função para carregar os dias ativos
    const loadActiveDays = async () => {
        // Testar com localStorage se o backend não estiver pronto
        const storedDays = localStorage.getItem('activeDays');
        activeDays = storedDays ? JSON.parse(storedDays) : [];
        renderCalendar();
    };

    // Salvar os dias ativos
    const saveActiveDays = () => {
        localStorage.setItem('activeDays', JSON.stringify(activeDays));
    };

    // Função para renderizar o calendário
    const renderCalendar = () => {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        adminCalendar.innerHTML = '';

        // Preencher os espaços antes do primeiro dia
        for (let i = 0; i < firstDay; i++) {
            adminCalendar.innerHTML += `<div class="empty"></div>`;
        }

        // Renderizar os dias do mês
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day).toISOString().split('T')[0];
            const isActive = activeDays.includes(date);

            adminCalendar.innerHTML += `
                <div class="day ${isActive ? 'active' : ''}" data-date="${date}">
                    ${day}
                </div>`;
        }

        // Adicionar evento de clique nos dias
        adminCalendar.querySelectorAll('.day').forEach(day => {
            day.addEventListener('click', () => {
                const date = day.dataset.date;
                handleDaySelection(date);
            });
        });
    };

    // Função para lidar com a seleção de um dia
    const handleDaySelection = (date) => {
        selectedDateDisplay.textContent = `Data selecionada: ${date}`;
        daySettings.classList.remove('hidden');
        activateDateBtn.classList.toggle('hidden', activeDays.includes(date));
        timeManagement.classList.toggle('hidden', !activeDays.includes(date));
        timeList.innerHTML = '';

        if (activeDays.includes(date)) {
            renderTimesForDay(date);
        }

        activateDateBtn.onclick = () => {
            if (!activeDays.includes(date)) {
                activeDays.push(date);
                saveActiveDays();
                renderCalendar();
                handleDaySelection(date);
            }
        };
    };

    // Função para renderizar horários de um dia
    const renderTimesForDay = (date) => {
        const times = timesPerDay[date] || [];
        timeList.innerHTML = times.map(time => `
            <li>
                ${time}
                <button onclick="deleteTime('${date}', '${time}')">Remover</button>
            </li>`).join('');
    };

    // Adicionar horários padrão
    addDefaultTimesBtn.onclick = () => {
        const defaultTimes = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
        const date = selectedDateDisplay.textContent.split(': ')[1];

        if (!timesPerDay[date]) timesPerDay[date] = [];
        defaultTimes.forEach(time => {
            if (!timesPerDay[date].includes(time)) timesPerDay[date].push(time);
        });

        renderTimesForDay(date);
    };

    // Adicionar horário personalizado
    addCustomTimeBtn.onclick = () => {
        const time = customTimeInput.value;
        const date = selectedDateDisplay.textContent.split(': ')[1];

        if (!time) return alert('Por favor, insira um horário.');
        if (!timesPerDay[date]) timesPerDay[date] = [];

        if (!timesPerDay[date].includes(time)) {
            timesPerDay[date].push(time);
            renderTimesForDay(date);
        }
        customTimeInput.value = '';
    };

    // Remover horário
    window.deleteTime = (date, time) => {
        if (timesPerDay[date]) {
            timesPerDay[date] = timesPerDay[date].filter(t => t !== time);
            renderTimesForDay(date);
        }
    };

    // Inicializar
    loadActiveDays();
});
