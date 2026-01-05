import { makeExecutableSchema } from '@graphql-tools/schema';
import FitnessSchema from './query.gql'
import resolvers from './resolvers';

export default function init() {
  return makeExecutableSchema({
    typeDefs: FitnessSchema,
    resolvers: {
      IMuscle: {
        abdominals: 'abdominals',
        hamstrings: 'hamstrings',
        calves: 'calves',
        shoulders: 'shoulders',
        adductors: 'adductors',
        glutes: 'glutes',
        quadriceps: 'quadriceps',
        biceps: 'biceps',
        forearms: 'forearms',
        abductors: 'abductors',
        triceps: 'triceps',
        chest: 'chest',
        lower_back: 'lower_back',
        traps: 'traps',
        middle_back: 'middle_back',
        lats: 'lats',
        neck: 'neck',
      },
      IForce: {
        pull: 'pull',
        push: 'push',
        static: 'static',
      },
      ILevel: {
        beginner: 'beginner',
        intermediate: 'intermediate',
        expert: 'expert',
      },
      IMechanic: {
        compound: 'compound',
        isolation: 'isolation',
      },
      IEquipment: {
        body_only: 'body_only',
        machine: 'machine',
        kettlebells: 'kettlebells',
        dumbbell: 'dumbbell',
        cable: 'cable',
        barbell: 'barbell',
        bands: 'bands',
        medicine_ball: 'medicine_ball',
        exercise_ball: 'exercise_ball',
        e_z_curl_bar: 'e-z_curl_bar',
        foam_roll: 'foam_roll',
        other: 'other'
      },
      ICategory: {
        strength: 'strength',
        stretching: 'stretching',
        plyometrics: 'plyometrics',
        strongman: 'strongman',
        powerlifting: 'powerlifting',
        cardio: 'cardio',
        olympic_weightlifting: 'olympic_weightlifting',
        crossfit: 'crossfit',
        weighted_bodyweight: 'weighted_bodyweight',
        assisted_bodyweight: 'assisted_bodyweight',
      },
      ...resolvers()
    }
  })
}
