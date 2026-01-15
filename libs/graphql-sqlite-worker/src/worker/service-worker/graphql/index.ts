import { mergeSchemas } from '@graphql-tools/schema';
import Exercise from './Exercise'
import ExercisePreset from './ExercisePreset'
import Fitness from './Fitness'
import Schedule from './Schedule'
import Sets from './Sets'

export const mergedSchema = mergeSchemas({
  schemas: [
    Schedule(),
    Exercise(),
    ExercisePreset(),
    Sets(),
    Fitness(),
  ],
})