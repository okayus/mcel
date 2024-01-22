<template>
  <el-button text @click="dialogFormVisible = true">
    open a Form nested Dialog
  </el-button>

  <el-dialog
    v-model="dialogFormVisible"
    title="Please enter your credentials and the database you wish to store them in"
  >
    <el-form :model="form">
      <el-form-item label="Notion API key" :label-width="formLabelWidth">
        <el-input v-model="form.apiKey" autocomplete="off" />
      </el-form-item>
      <el-form-item label="Database id" :label-width="formLabelWidth">
        <el-input v-model="form.databaseId" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveToNotion()">
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { Client } from '@notionhq/client';

const formLabelWidth = '140px';
const dialogFormVisible = ref(false);

const form = reactive({
  apiKey: '',
  databaseId: '',
});

const notion = new Client({ auth: form.apiKey });

const saveToNotion = (async () => {
  const databaseId = form.databaseId;
  const response = await notion.databases.retrieve({ database_id: databaseId });
  console.log(response);
});

</script>

<style scoped>
.el-button--text {
  margin-right: 15px;
}
.el-select {
  width: 300px;
}
.el-input {
  width: 300px;
}
.dialog-footer button:first-child {
  margin-right: 10px;
}
</style>
