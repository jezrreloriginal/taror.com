document.addEventListener('DOMContentLoaded', () => {
    const calendar = document.getElementById('calendar');
    const timeSlots = document.getElementById('timeSlots');
    const timeOptions = document.getElementById('timeOptions');
    const appointmentForm = document.getElementById('appointmentForm');
    const selectedDateField = document.getElementById('selectedDate');
    const selectedTimeField = document.getElementById('selectedTime');

    let activeDays = JSON.parse(localStorage.getItem('activeDays')) || [];
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const defaultSchedule = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

    const renderCalendar = () => {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        calendar.innerHTML = '';

        // Preencher os espaços antes do primeiro dia
        for (let i = 0; i < firstDay; i++) {
            calendar.innerHTML += `<div class="empty"></div>`;
        }

        // Renderizar os dias do mês
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day).toISOString().split('T')[0];
            const isActive = activeDays.includes(date);
            const isFullyBooked = appointments.filter(app => app.appointmentDate === date).length >= defaultSchedule.length;

            calendar.innerHTML += `
                <div class="day ${isActive ? 'active' : ''} ${isFullyBooked ? 'fully-booked' : ''}" data-date="${date}">
                    ${day}
                </div>`;
        }

        // Adicionar eventos aos dias ativos
        calendar.querySelectorAll('.day.active:not(.fully-booked)').forEach(day => {
            day.addEventListener('click', () => handleDaySelection(day.dataset.date));
        });
    };

    const handleDaySelection = (date) => {
        selectedDateField.value = date.split('-').reverse().join('/');
        timeSlots.classList.remove('hidden');

        const bookedTimes = appointments
            .filter(app => app.appointmentDate === date)
            .map(app => app.appointmentTime);

        timeOptions.innerHTML = defaultSchedule.map(time => `
            <button class="${bookedTimes.includes(time) ? 'disabled' : ''}" data-time="${time}" ${bookedTimes.includes(time) ? 'disabled' : ''}>
                ${time}
            </button>`).join('');

        timeOptions.querySelectorAll('button:not(.disabled)').forEach(button => {
            button.addEventListener('click', () => {
                selectedTimeField.value = button.dataset.time;
            });
        });
    };

    appointmentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(appointmentForm);
        const appointment = Object.fromEntries(formData);

        if (!appointment.selectedDate || !appointment.selectedTime) {
            alert('Por favor, selecione uma data e horário.');
            return;
        }

        appointments.push({
            name: appointment.name,
            phone: appointment.phone,
            appointmentDate: appointment.selectedDate.split('/').reverse().join('-'),
            appointmentTime: appointment.selectedTime
        });

        localStorage.setItem('appointments', JSON.stringify(appointments));
        alert('Agendamento confirmado!');
        appointmentForm.reset();
        renderCalendar();
    });

    renderCalendar();
});
