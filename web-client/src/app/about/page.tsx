'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  TruckIcon,
  GlobeAltIcon,
  UserGroupIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

const values = [
  {
    name: 'Innovation',
    description:
      'Nous repoussons constamment les limites de la technologie pour améliorer l\'expérience de livraison.',
    icon: GlobeAltIcon,
  },
  {
    name: 'Excellence',
    description:
      'Nous nous efforçons d\'offrir un service de la plus haute qualité à chaque livraison.',
    icon: TruckIcon,
  },
  {
    name: 'Communauté',
    description:
      'Nous créons des liens durables avec nos clients, partenaires et employés.',
    icon: UserGroupIcon,
  },
  {
    name: 'Engagement',
    description:
      'Nous sommes dévoués à la satisfaction de nos clients et au bien-être de notre équipe.',
    icon: HeartIcon,
  },
];

const team = [
  {
    name: 'Alexandre Martin',
    role: 'PDG & Fondateur',
    image: '/team/1.jpg',
    bio: 'Plus de 15 ans d\'expérience dans la logistique et le transport.',
  },
  {
    name: 'Sarah Dubois',
    role: 'Directrice des Opérations',
    image: '/team/2.jpg',
    bio: 'Experte en optimisation des processus et gestion de flotte.',
  },
  {
    name: 'Lucas Bernard',
    role: 'Directeur Technique',
    image: '/team/3.jpg',
    bio: 'Passionné par l\'innovation technologique et les solutions mobiles.',
  },
];

const stats = [
  { label: 'Livraisons réussies', value: '100K+' },
  { label: 'Clients satisfaits', value: '50K+' },
  { label: 'Villes desservies', value: '30+' },
  { label: 'Chauffeurs partenaires', value: '1000+' },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-primary-800">
        <div className="absolute inset-0">
          <Image
            src="/about-hero.jpg"
            alt="Notre équipe"
            layout="fill"
            objectFit="cover"
            className="opacity-30"
          />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl text-center"
          >
            À propos de Transwift
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-xl text-primary-100 max-w-3xl mx-auto text-center"
          >
            Nous révolutionnons l'industrie de la livraison avec une approche centrée sur la technologie et l'humain.
          </motion.p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Notre Mission
            </h2>
            <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
              Transwift a été fondée avec une vision claire : rendre la livraison plus efficace, plus fiable et plus durable.
              Nous combinons technologie de pointe et service personnalisé pour offrir la meilleure expérience possible.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Nos Valeurs
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              Les principes qui guident chacune de nos actions.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => (
                <motion.div
                  key={value.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="pt-6"
                >
                  <div className="flow-root bg-white rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                          <value.icon
                            className="h-6 w-6 text-white"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                        {value.name}
                      </h3>
                      <p className="mt-5 text-base text-gray-500">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-primary-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Transwift en chiffres
            </h2>
          </div>
          <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-4 sm:gap-8">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex flex-col"
              >
                <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-200">
                  {stat.label}
                </dt>
                <dd className="order-1 text-5xl font-extrabold text-white">
                  {stat.value}
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 text-center sm:px-6 lg:px-8 lg:py-24">
          <div className="space-y-12">
            <div className="space-y-5 sm:mx-auto sm:max-w-xl sm:space-y-4 lg:max-w-5xl">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Notre Équipe
              </h2>
              <p className="text-xl text-gray-500">
                Des professionnels passionnés qui travaillent chaque jour pour améliorer votre expérience.
              </p>
            </div>
            <ul className="mx-auto space-y-16 sm:grid sm:grid-cols-2 sm:gap-16 sm:space-y-0 lg:grid-cols-3 lg:max-w-5xl">
              {team.map((person, index) => (
                <motion.li
                  key={person.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <div className="space-y-6">
                    <div className="relative h-40 w-40 mx-auto rounded-full overflow-hidden">
                      <Image
                        src={person.image}
                        alt={person.name}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="text-lg leading-6 font-medium space-y-1">
                        <h3>{person.name}</h3>
                        <p className="text-primary-600">{person.role}</p>
                      </div>
                      <p className="text-gray-500">{person.bio}</p>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
