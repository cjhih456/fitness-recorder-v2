import { mergeSchemas } from '@graphql-tools/schema';
import Schedule from './Schedule'
import Exercise from './Exercise'
import ExercisePreset from './ExercisePreset'
import Sets from './Sets'
import Fitness from './Fitness'

export const mergedSchema = mergeSchemas({
  schemas: [
    Schedule(),
    Exercise(),
    ExercisePreset(),
    Sets(),
    Fitness(),
  ],
})