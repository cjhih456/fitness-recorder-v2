import type { ScheduleData, ScheduleCreateType } from '@fitness-recoder/structure'
import { IScheduleSchema } from '@fitness-recoder/structure'

function parseSchedule(row: unknown): ScheduleData {
  return IScheduleSchema.parse(row)
}

export const getScheduleById: ResponseBuilder<{ id: number }, ScheduleData | null> = async ({ dbBus }, { id }) => {
  const schedule = await dbBus?.sendTransaction<ScheduleData>(
    'select', 'select * from schedule where id=?',
    [id]
  )
  return schedule?.[0] ? parseSchedule(schedule[0]) : null
}

export const getScheduleByDate: ResponseBuilder<{ year: number, month: number, date: number }, ScheduleData[] | null> = async ({ dbBus }, { year, month, date }) => {
  const scheduleList = await dbBus?.sendTransaction<ScheduleData>(
    'selects', 'select * from schedule where year=? and month=? and date=?',
    [year, month, date]
  )
  return (scheduleList ?? []).map(parseSchedule)
}

export const getScheduleStatusByMonth: ResponseBuilder<{ year: number, month: number }, string[][] | null> = async ({ dbBus }, { year, month }) => {
  const scheduleList = await dbBus?.sendTransaction<{ date: number, type: string }>(
    'selects', 'select year, month, date, group_concat(type) as type from schedule where year=? and month=? group by year, month, date',
    [year, month]
  )
  return scheduleList?.reduce((acc, cur) => {
    acc[cur.date] = cur.type.split(',')
    return acc
  }, [] as string[][]) ?? []
}

export const createSchedule: ResponseBuilder<{ schedule: ScheduleCreateType }, ScheduleData | null> = async ({ dbBus }, { schedule }) => {
  const result = await dbBus?.sendTransaction<ScheduleData>(
    'insert', 'insert into schedule (year, month, date, title, type, start, beforeTime, breakTime, workoutTimes) values (?,?,?,?,?,?,?,?,?) RETURNING *',
    [schedule.year, schedule.month, schedule.date, schedule.title, schedule.type, 0, 0, 0, 0]
  )
  return result?.[0] ? parseSchedule(result[0]) : null
}
export const updateSchedule: ResponseBuilder<{ schedule: ScheduleData }, ScheduleData | null> = async ({ dbBus }, { schedule }) => {
  const result = await dbBus?.sendTransaction<ScheduleData>(
    'update', 'update schedule set year=?, month=?, date=?, title=?, beforeTime=?, start=?, breakTime=?, workoutTimes=?, type=? where id=? RETURNING *',
    [schedule.year, schedule.month, schedule.date, schedule.title, schedule.beforeTime, schedule.start, schedule.breakTime, schedule.workoutTimes, schedule.type, schedule.id]
  )
  return result?.[0] ? parseSchedule(result[0]) : null
}
export const deleteSchedule: ResponseBuilder<{ id: number }, string | null> = async ({ dbBus }, { id }) => {
  const result = await dbBus?.sendTransaction<ScheduleData>(
    'delete', 'delete from schedule where id=?',
    [id]
  )
  return result ? 'delete - schedule - ' + id : null
}
