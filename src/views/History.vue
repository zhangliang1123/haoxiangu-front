<template>
  <div class="history-page">
    <h2>点餐历史</h2>
    
    <el-empty v-if="orderRecords.length === 0" description="暂无点餐记录" />
    
    <el-timeline v-else>
      <el-timeline-item
        v-for="record in orderRecords"
        :key="record.id"
        :timestamp="record.time"
        placement="top"
      >
        <el-card>
          <h4>点餐人：{{ record.userName }}</h4>
          <h4>今日菜谱</h4>
          <el-tag
            v-for="name in record.recipeNames" :key="name" style="margin-right: 10px; margin-bottom: 10px">
            {{ name }}
          </el-tag>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFamilyStore } from '@/stores/family'

const familyStore = useFamilyStore()

const orderRecords = computed(() => familyStore.currentFamily?.orderRecords || [])
</script>

<style scoped>
.history-page h2 {
  margin-bottom: 20px;
}

.el-card h4 {
  margin: 0 0 10px 0;
}
</style>
