package com.pedrorlemos.music_studio.model.services;

import com.pedrorlemos.music_studio.model.entities.Appointment;
import com.pedrorlemos.music_studio.model.entities.AppointmentType;
import com.pedrorlemos.music_studio.model.repositories.AppointmentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @InjectMocks
    private AppointmentService appointmentService;

    private Appointment appointment(int startHour, int endHour) {
        return new Appointment(
                AppointmentType.GUITAR_LESSON,
                LocalDateTime.of(2026, 10, 30, startHour, 0),
                LocalDateTime.of(2026, 10, 30, endHour, 0),
                "");
    }

    @Test
    void addAppointmentSavesWhenThereAreNoAppointments() {
        Appointment newAppointment = appointment(10, 12);
        when(appointmentRepository.findAll()).thenReturn(List.of());

        assertTrue(appointmentService.addAppointment(newAppointment));
        verify(appointmentRepository).save(newAppointment);
    }

    @Test
    void addAppointmentRejectsAndDoesNotSaveConflictingAppointment() {
        when(appointmentRepository.findAll()).thenReturn(List.of(appointment(10, 12)));

        assertFalse(appointmentService.addAppointment(appointment(11, 13)));
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    void addAppointmentSavesAppointmentThatOnlyTouches() {
        Appointment newAppointment = appointment(12, 14);
        when(appointmentRepository.findAll()).thenReturn(List.of(appointment(10, 12)));

        assertTrue(appointmentService.addAppointment(newAppointment));
        verify(appointmentRepository).save(newAppointment);
    }
}