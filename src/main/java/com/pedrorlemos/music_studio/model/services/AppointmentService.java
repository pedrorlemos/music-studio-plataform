package com.pedrorlemos.music_studio.model.services;

import com.pedrorlemos.music_studio.model.entities.Appointment;

import java.util.ArrayList;
import java.util.List;

public class AppointmentService {

    private List<Appointment> appointments =  new ArrayList<>();

    public AppointmentService() {
    }

    public List<Appointment> getAppointments() {
        return appointments;
    }

    public boolean addAppointment(Appointment newAppointment) {
        for(Appointment appointment : appointments) {
            if(appointment.overlaps(newAppointment)) {
                return false;
            }
        }
        appointments.add(newAppointment);
        return true;
    }


}
