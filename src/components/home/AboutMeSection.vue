<script setup lang="ts">
import SectionTitle from '@/components/ui/SectionTitle.vue';
</script>
<template>
    <section class="py-16">
        <SectionTitle title="Spationaute du Web" astronaut-image="/src/assets/illustrations/astronaut-moon.svg" />
        <h4 class="text-secondary text-center my-4 italic">En exploration constante des frontières du développement web.
        </h4>
        <div class="container mx-auto px-2 md:px-4">
            <div class="mx-auto card">
                <div class="grid md:grid-cols-[30%_1fr] gap-6 md:gap-12 place-items-center">
                    <div class="flex justify-center w-full">
                        <img class="xl:max-w-lg w-3/4 " src="/assets/profile-pictures/Samy-Selfie-Round-Blue.webp"
                            alt="Portrait Samy SEBAHI">
                    </div>
                    <div>
                        <p class="text-primary">
                            Développeur web passionné, je transforme vos idées en solutions numériques concrètes. Mon
                            parcours comme
                            développeur en alternance chez Shifter et ma formation FullStack chez Cloud Campus m'ont
                            permis
                            d'acquérir une expertise solide dans la création d'applications web sur-mesure. Aujourd'hui,
                            je mets à
                            profit ces compétences techniques en proposant mes services de conception web en freelance.
                            Cette double
                            expérience me permet d'aborder vos projets avec une vision complète, alliant performance
                            technique et
                            expérience utilisateur intuitive, pour des solutions web répondant précisément à vos
                            besoins.
                        </p>
                        <blockquote class="space-y-2 p-4 text-primary">
                            <p class="italic text-sm text-left">
                                Visez la lune.<br>Même si vous la manquez, vous atterrirez parmi les étoiles. <span
                                    class="not-italic">🌕 ✨</span>
                            </p>
                            <footer class="text-left text-sm">
                                — Norman Vincent Peale
                            </footer>
                        </blockquote>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>