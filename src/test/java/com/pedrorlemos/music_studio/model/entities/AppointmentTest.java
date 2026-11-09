package com.pedrorlemos.music_studio.model.entities;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class AppointmentTest {

    private Appointment appointment(int startHour, int startMinute, int endHour, int endMinute) {
        return new Appointment(
                AppointmentType.GUITAR_LESSON,
                LocalDateTime.of(2026, 10, 30, startHour, startMinute),
                LocalDateTime.of(2026, 10, 30, endHour, endMinute),
                "");
    }

    @Test
    void overlapsReturnsFalseWhenOneEndsExactlyWhenOtherStarts() {
        Appointment first = appointment(10, 0, 12, 0);
        Appointment second = appointment(12, 0, 14, 0);

        assertFalse(first.overlaps(second));
    }

    @Test
    void overlapsReturnsFalseWhenOtherEndsBeforeFirstStarts() {
        Appointment first = appointment(10, 0, 12, 0);
        Appointment second = appointment(8, 0, 9, 0);

        assertFalse(first.overlaps(second));
    }

    @Test
    void overlapsReturnsFalseWhenOtherStartsAfterFirstEnds() {
        Appointment first = appointment(10, 0, 12, 0);
        Appointment second = appointment(13, 0, 14, 0);

        assertFalse(first.overlaps(second));
    }

    @Test
    void overlapsReturnsTrueWhenOtherStartsInsideFirst() {
        Appointment first = appointment(10, 0, 12, 0);
        Appointment second = appointment(11, 0, 13, 0);

        assertTrue(first.overlaps(second));
    }

    @Test
    void overlapsReturnsTrueWhenOtherIsInsideFirst() {
        Appointment first = appointment(10, 0, 12, 0);
        Appointment second = appointment(10, 30, 11, 30);

        assertTrue(first.overlaps(second));
    }

    @Test
    void overlapsReturnsTrueWhenOtherContainsFirst() {
        Appointment first = appointment(10, 0, 12, 0);
        Appointment second = appointment(9, 0, 13, 0);

        assertTrue(first.overlaps(second));
    }

    @Test
    void constructorThrowsWhenEndIsBeforeStart() {
        assertThrows(IllegalArgumentException.class, () -> appointment(12, 0, 10, 0));
    }

    @Test
    void constructorThrowsWhenEndEqualsStart() {
        assertThrows(IllegalArgumentException.class, () -> appointment(10, 0, 10, 0));
    }

    @Test
    void setEndTimeThrowsWhenNewEndIsBeforeStart() {
        Appointment appointment = appointment(10, 0, 12, 0);

        assertThrows(IllegalArgumentException.class,
                () -> appointment.setEndTime(LocalDateTime.of(2026, 10, 30, 9, 0)));
    }

    @Test
    void setStartTimeThrowsWhenNewStartIsAfterEnd() {
        Appointment appointment = appointment(10, 0, 12, 0);

        assertThrows(IllegalArgumentException.class,
                () -> appointment.setStartTime(LocalDateTime.of(2026, 10, 30, 13, 0)));
    }
}