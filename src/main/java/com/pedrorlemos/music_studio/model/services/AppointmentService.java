package com.pedrorlemos.music_studio.model.services;

import com.pedrorlemos.music_studio.model.entities.Appointment;
import com.pedrorlemos.music_studio.model.repositories.AppointmentRepository;
import org.springframework.stereotype.Service;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }


    public boolean addAppointment(Appointment newAppointment) {
        for(Appointment appointment : appointmentRepository.findAll()) {
            if(appointment.overlaps(newAppointment)) {
                return false;
            }
        }
        appointmentRepository.save(newAppointment);
        return true;
    }


}
