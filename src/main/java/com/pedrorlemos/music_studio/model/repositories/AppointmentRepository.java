package com.pedrorlemos.music_studio.model.repositories;

import com.pedrorlemos.music_studio.model.entities.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
}
