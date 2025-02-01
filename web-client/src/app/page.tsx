'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  TruckIcon,
  ClockIcon,
  ShieldCheckIcon,
  StarIcon,
  ChevronRightIcon,
  MapPinIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Livraison rapide',
    description: 'Service de livraison express disponible 24h/24 et 7j/7',
    icon: TruckIcon,
  },
  {
    name: 'Suivi en temps réel',
    description: 'Suivez vos livraisons en temps réel sur la carte',
    icon: MapPinIcon,
  },
  {
    name: 'Sécurité garantie',
    description: 'Vos colis sont assurés et sécurisés pendant le transport',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Service client premium',
    description: 'Une équipe dédiée à votre service',
    icon: UserGroupIcon,
  },
];

const testimonials = [
  {
    content:
      'Transwift a révolutionné notre logistique. Service rapide et fiable !',
    author: 'Marie D.',
    role: 'Directrice E-commerce',
    image: '/testimonials/1.jpg',
  },
  {
    content:
      'La meilleure expérience de livraison que nous ayons eue. Hautement recommandé !',
    author: 'Thomas L.',
    role: 'Entrepreneur',
    image: '/testimonials/2.jpg',
  },
  {
    content:
      'Un service client exceptionnel et des livreurs professionnels.',
    author: 'Sophie M.',
    role: 'Responsable Logistique',
    image: '/testimonials/3.jpg',
  },
];

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="absolute inset-0">
          <Image
            src="/hero-pattern.jpg"
            alt="Background pattern"
            layout="fill"
            objectFit="cover"
            className="opacity-10"
          />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Livraison rapide et fiable
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-xl text-primary-100 max-w-3xl"
          >
            Transwift révolutionne la livraison avec une technologie de pointe et un service client exceptionnel.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex space-x-4"
          >
            <Link
              href="/register"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Commencer
              <ChevronRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-500 bg-opacity-60 hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              En savoir plus
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              Fonctionnalités
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Une meilleure façon de livrer
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Découvrez pourquoi Transwift est le choix préféré des entreprises pour leurs besoins en livraison.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              {features.map((feature) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {feature.name}
                    </h3>
                    <p className="mt-2 text-base text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-16">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              Témoignages
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Ce que nos clients disent
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-white p-8 rounded-lg shadow-lg"
              >
                <div className="flex items-center mb-6">
                  <div className="h-12 w-12 rounded-full overflow-hidden">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.author}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      {testimonial.author}
                    </h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600">{testimonial.content}</p>
                <div className="mt-4 flex text-primary-500">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-700">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:flex lg:items-center lg:justify-between"
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Prêt à commencer ?</span>
              <span className="block text-primary-200">
                Rejoignez Transwift aujourd'hui.
              </span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50"
                >
                  Créer un compte
                </Link>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Nous contacter
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
