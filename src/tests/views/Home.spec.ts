import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import HomePage from '@/views/Home.vue';
import HeroSection from '@/components/home/HeroSection.vue';
import ServicePreviewSection from '@/components/home/ServicePreviewSection.vue';
import PortfolioSection from '@/components/home/PortfolioSection.vue';
import AboutMeSection from '@/components/home/AboutMeSection.vue';
import ProcessusSection from '@/components/home/ProcessusSection.vue';
import TechnologiesSection from '@/components/home/TechnologiesSection.vue';
import MyPathSection from '@/components/home/MyPathSection.vue';

// Mocks pour tous les composants enfants
vi.mock('@/components/home/HeroSection.vue');
vi.mock('@/components/home/ServicePreviewSection.vue');
vi.mock('@/components/home/PortfolioSection.vue');
vi.mock('@/components/home/AboutMeSection.vue');
vi.mock('@/components/home/ProcessusSection.vue');
vi.mock('@/components/home/TechnologiesSection.vue');
vi.mock('@/components/home/MyPathSection.vue');

describe('HomePage', () => {
    it('monte correctement avec tous les composants de section', () => {
        const wrapper = mount(HomePage);

        // Vérifier que le conteneur principal existe
        expect(wrapper.find('div.min-h-screen').exists()).toBe(true);

        // Vérifier que tous les composants de section sont présents
        expect(wrapper.findComponent(HeroSection).exists()).toBe(true);
        expect(wrapper.findComponent(ServicePreviewSection).exists()).toBe(true);
        expect(wrapper.findComponent(PortfolioSection).exists()).toBe(true);
        expect(wrapper.findComponent(AboutMeSection).exists()).toBe(true);
        expect(wrapper.findComponent(MyPathSection).exists()).toBe(true);
        expect(wrapper.findComponent(TechnologiesSection).exists()).toBe(true);
        expect(wrapper.findComponent(ProcessusSection).exists()).toBe(true);
    });
});