package com.pedrorlemos.music_studio.model.entities;
import java.time.Duration;

public enum AppointmentType {
    SINGING_LESSON(Duration.ofHours(2)),
    KEYBOARD_LESSON(Duration.ofHours(2)),
    GUITAR_LESSON(Duration.ofHours(2)),
    ACOUSTIC_GUITAR_LESSON(Duration.ofHours(2)),
    BASS_LESSON(Duration.ofHours(2)),
    BAND_BOOKING(Duration.ofHours(1)),
    MUSIC_PRODUCTION(Duration.ofHours(1));

    private final Duration defaultDuration;

    AppointmentType(Duration defaultDuration) {
        this.defaultDuration = defaultDuration;
    }

    public Duration getDefaultDuration() {
        return defaultDuration;
    }
}
