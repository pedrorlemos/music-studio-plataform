package com.pedrorlemos.music_studio.controllers;

import com.pedrorlemos.music_studio.model.entities.Appointment;
import com.pedrorlemos.music_studio.model.services.AppointmentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {
    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }
    @GetMapping
    public List<Appointment> findAll(){
        return appointmentService.findAll();
    }
}
