<script setup lang="ts">
</script>

    <template>
        <section class="py-6">
            <div class="container mx-auto px-2 md:px-4">
                <div class="grid grid-cols-1 md:grid-cols-[1fr_1fr]">
                    <div class="flex flex-col items-center justify-center">
                        <div class="relative">
                            <div
                                class="absolute blur-xl opacity-70 -inset-1 bg-gradient-to-r from-accent to-emphasis rounded">
                            </div>
                            <h2 class="relative text-3xl md:text-4xl font-bold text-secondary text-center">
                                Samy SEBAHI
                                <br>
                                Développeur Web
                            </h2>
                        </div>
                    </div>
                    <img class="size-16 md:size-24 mt-4 justify-self-end astronaut-float"
                        src="@/assets/illustrations/astronaut-float.svg" alt="Astronaute Flottant">
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 md:gap-4 mx-auto text-center card space-y-4">
                    <img class="max-w-xs md:max-w-sm m-auto" src="@/assets/illustrations/laptop-rocket-money.webp"
                        alt="Laptop Rocket Money">
                    <div class="flex flex-col justify-center gap-8">
                        <h1 class="text-xl md:text-3xl font-bold">
                            Propulsez votre business grâce à des solutions webs adaptées à votre budget !
                        </h1>
                        <h2>Lanceur de projets et créateur d'univers numériques, votre partenaire pour une expédition web réussie.</h2>
                        <router-link to="/services" class="btn-primary md:text-xl">
                            Découvrir mes solutions
                        </router-link>
                    </div>
                </div>
            </div>
        </section>
    </template>
