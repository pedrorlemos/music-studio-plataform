package com.pedrorlemos.music_studio.model.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;
@Entity
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private AppointmentType appointmentType;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String description;

    protected Appointment() {}

    public Appointment(AppointmentType appointmentType, LocalDateTime startTime, LocalDateTime endTime, String description) {
        validate(startTime, endTime);
        this.appointmentType = appointmentType;
        this.startTime = startTime;
        this.endTime = endTime;
        this.description = description;

    }

    public AppointmentType getAppointmentType() {
        return appointmentType;
    }

    public Long getId() {
        return id;
    }

    public void setAppointmentType(AppointmentType appointmentType) {
        this.appointmentType = appointmentType;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        validate(startTime, this.endTime);
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        validate(this.startTime, endTime);
        this.endTime = endTime;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean overlaps(Appointment other) {
        boolean endsBeforeOtherStarts = !this.endTime.isAfter(other.startTime);
        boolean otherEndsBeforeThisStarts = !other.endTime.isAfter(this.startTime);
        boolean noConflict = endsBeforeOtherStarts || otherEndsBeforeThisStarts;
        return !noConflict;
    }

    private void validate(LocalDateTime start, LocalDateTime end) {
        if (!end.isAfter(start)) {
            throw new IllegalArgumentException("O fim deve ser depois do início");
        }
    }
}
