<script setup></script>

<template>
  <div class="base-card">
    <slot>
      <p>BaseDashboardCard Area</p>
    </slot>
  </div>
</template>

<style scoped>
.base-card {
  margin-top: 1.25rem;
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background-soft);
}
</style>
