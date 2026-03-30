import { getTeachers, getSubjects, getRooms, getClasses } from './bilimclassAPI';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MAX_PERIODS = 7;

export const ITEM_TYPES = {
  LESSON: 'lesson',
  PAIR: 'pair',
  LENTA: 'lenta',
  EVENT: 'event',
  ACADEMIC: 'academic',
};

function isTeacherFree(schedule, teacherId, day, period) {
  for (const classId of Object.keys(schedule)) {
    const slot = schedule[classId]?.[day]?.[period];
    if (slot && slot.teacherId === teacherId) return false;
  }
  return true;
}

function isRoomFree(schedule, roomId, day, period) {
  for (const classId of Object.keys(schedule)) {
    const slot = schedule[classId]?.[day]?.[period];
    if (slot && slot.roomId === roomId) return false;
  }
  return true;
}

function findAvailableRoom(schedule, day, period, rooms) {
  for (const room of rooms) {
    if (isRoomFree(schedule, room.id, day, period)) {
      return room.id;
    }
  }
  return null;
}

export function generateSchedule(constraints = {}) {
  const teachers = getTeachers();
  const subjects = getSubjects();
  const rooms = getRooms();
  const classes = getClasses();

  const schedule = {};
  const conflicts = [];

  classes.forEach(cls => {
    schedule[cls.id] = {};
    DAYS.forEach(day => {
      schedule[cls.id][day] = {};
    });
  });

  const subjectTeacher = {};
  subjects.forEach(sub => {
    const teacher = teachers.find(t => t.subjects.includes(sub.id));
    if (teacher) {
      subjectTeacher[sub.id] = teacher.id;
    }
  });

  const weeklyHours = {
    math: 4, geometry: 2, physics: 3, chemistry: 2, biology: 2,
    history: 2, kazakh: 3, russian: 3, english: 3, informatics: 2,
    geography: 1, pe: 2,
  };

  classes.forEach(cls => {
    const subjectSlots = { ...weeklyHours };

    for (let dayIdx = 0; dayIdx < DAYS.length; dayIdx++) {
      const day = DAYS[dayIdx];
      const maxPerDay = dayIdx === 5 ? 5 : MAX_PERIODS;

      for (let period = 1; period <= maxPerDay; period++) {
        let assigned = false;
        const subjectKeys = Object.keys(subjectSlots).sort(() => Math.random() - 0.5);

        for (const subId of subjectKeys) {
          if (subjectSlots[subId] <= 0) continue;

          const teacherId = subjectTeacher[subId];
          if (!teacherId) continue;

          const teacher = teachers.find(t => t.id === teacherId);
          if (!teacher.available.includes(dayIdx + 1)) continue;

          if (!isTeacherFree(schedule, teacherId, day, period)) continue;

          const roomId = findAvailableRoom(schedule, day, period, rooms);
          if (!roomId) continue;

          const subject = subjects.find(s => s.id === subId);
          schedule[cls.id][day][period] = {
            subjectId: subId,
            subjectName: subject.name,
            subjectNameEn: subject.nameEn,
            teacherId,
            teacherName: teacher.name,
            teacherNameEn: teacher.nameEn,
            roomId,
            roomName: rooms.find(r => r.id === roomId)?.name,
            type: ITEM_TYPES.LESSON,
          };

          subjectSlots[subId]--;
          assigned = true;
          break;
        }

        if (!assigned) {
          for (const subId of Object.keys(subjectSlots)) {
            if (subjectSlots[subId] > 0) {
              const teacherId = subjectTeacher[subId];
              if (teacherId && isTeacherFree(schedule, teacherId, day, period)) {
                const roomId = findAvailableRoom(schedule, day, period, rooms);
                if (roomId) {
                  const subject = subjects.find(s => s.id === subId);
                  const teacher = teachers.find(t => t.id === teacherId);
                  schedule[cls.id][day][period] = {
                    subjectId: subId,
                    subjectName: subject.name,
                    subjectNameEn: subject.nameEn,
                    teacherId,
                    teacherName: teacher.name,
                    teacherNameEn: teacher.nameEn,
                    roomId,
                    roomName: rooms.find(r => r.id === roomId)?.name,
                    type: ITEM_TYPES.LESSON,
                  };
                  subjectSlots[subId]--;
                  break;
                }
              }
            }
          }
        }
      }
    }
  });

  classes.forEach(cls => {
    DAYS.forEach(day => {
      Object.keys(schedule[cls.id][day]).forEach(period => {
        const slot = schedule[cls.id][day][period];
        if (!slot) return;

        classes.forEach(otherCls => {
          if (otherCls.id === cls.id) return;
          const otherSlot = schedule[otherCls.id]?.[day]?.[period];
          if (otherSlot && otherSlot.teacherId === slot.teacherId) {
            conflicts.push({
              type: 'teacher_overlap',
              teacher: slot.teacherName,
              day,
              period,
              classes: [cls.name, otherCls.name],
            });
          }
        });
      });
    });
  });

  return { schedule, conflicts };
}

export function handleTeacherSick(schedule, sickTeacherId) {
  const teachers = getTeachers();
  const sickTeacher = teachers.find(t => t.id === sickTeacherId);
  if (!sickTeacher) return { schedule, replacements: [], errors: [] };

  const replacements = [];
  const errors = [];
  const newSchedule = JSON.parse(JSON.stringify(schedule));

  Object.keys(newSchedule).forEach(classId => {
    DAYS.forEach(day => {
      Object.keys(newSchedule[classId][day]).forEach(period => {
        const slot = newSchedule[classId][day][period];
        if (slot && slot.teacherId === sickTeacherId) {
          const replacement = teachers.find(t =>
            t.id !== sickTeacherId &&
            t.subjects.some(s => sickTeacher.subjects.includes(s)) &&
            isTeacherFree(newSchedule, t.id, day, parseInt(period))
          );

          if (replacement) {
            newSchedule[classId][day][period] = {
              ...slot,
              teacherId: replacement.id,
              teacherName: replacement.name,
              teacherNameEn: replacement.nameEn,
              isReplacement: true,
              originalTeacher: sickTeacher.name,
            };
            replacements.push({
              day, period, classId,
              subject: slot.subjectName,
              original: sickTeacher.name,
              replacement: replacement.name,
            });
          } else {
            newSchedule[classId][day][period] = {
              ...slot,
              isCancelled: true,
              originalTeacher: sickTeacher.name,
            };
            errors.push({
              day, period, classId,
              subject: slot.subjectName,
              message: 'Замена не найдена',
            });
          }
        }
      });
    });
  });

  return { schedule: newSchedule, replacements, errors };
}

export function addEvent(schedule, event) {
  const { classId, day, period, title, type = ITEM_TYPES.EVENT } = event;
  const newSchedule = JSON.parse(JSON.stringify(schedule));

  if (!newSchedule[classId]) newSchedule[classId] = {};
  if (!newSchedule[classId][day]) newSchedule[classId][day] = {};

  newSchedule[classId][day][period] = {
    subjectName: title,
    subjectNameEn: title,
    type,
    isEvent: true,
  };

  return newSchedule;
}

export { DAYS, MAX_PERIODS };
