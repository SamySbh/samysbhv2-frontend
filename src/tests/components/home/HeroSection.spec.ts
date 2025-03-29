import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Hero from '@/components/home/HeroSection.vue';

describe('Hero', () => {
    it('affiche le titre avec le nom du développeur', () => {
        const wrapper = mount(Hero);

        // Vérifier que le titre avec le nom est présent
        const title = wrapper.find('h2');
        expect(title.text()).toContain('Samy SEBAHI');
        expect(title.text()).toContain('Développeur Web');
    });

    it('affiche le slogan principal', () => {
        const wrapper = mount(Hero);

        // Vérifier que le slogan principal est présent
        const slogan = wrapper.find('h1');
        expect(slogan.text()).toContain('Propulsez votre business');
    });

    it('contient un lien vers la page des services', () => {
        const wrapper = mount(Hero, {
            global: {
                stubs: ['router-link']
            }
        });

        // Vérifier simplement que le lien vers les services existe
        const servicesLink = wrapper.find('router-link-stub[to="/services"]');
        expect(servicesLink.exists()).toBe(true);
    });

    it('affiche les illustrations', () => {
        const wrapper = mount(Hero);

        // Vérifier que les images sont présentes
        const images = wrapper.findAll('img');
        expect(images.length).toBe(2);

        // Vérifier l'astronaute
        const astronautImage = wrapper.find('img[alt="Astronaute Flottant"]');
        expect(astronautImage.exists()).toBe(true);

        // Vérifier l'image principale
        const mainImage = wrapper.find('img[alt="Laptop Rocket Money"]');
        expect(mainImage.exists()).toBe(true);
    });
});