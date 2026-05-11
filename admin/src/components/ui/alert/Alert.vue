<script setup lang="ts">
import { cn } from "@/lib/utils"
import { type HTMLAttributes } from "vue"
import { type AlertVariants, alertVariants } from "./index"

const props = defineProps<{
  class?: HTMLAttributes["class"]
  variant?: AlertVariants["variant"]
}>()
</script>

<template>
  <div
    :class="cn(alertVariants({ variant }), props.class)"
    role="alert"
  >
    <slot />
  </div>
</template>