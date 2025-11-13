/**
 * シミュレーターでの実機テスト用スクリプト
 * 「Expo MCP Test」というTODOをSupabaseに追加します
 */

import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAddTodo() {
  try {
    console.log('🔐 ログイン中...');
    
    // ログイン
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'keitanamazue@gmail.com',
      password: 'Test1234',
    });

    if (authError) {
      console.error('❌ ログインエラー:', authError.message);
      throw authError;
    }

    console.log('✅ ログイン成功:', authData.user?.email);

    // TODOを追加
    console.log('📝 TODOを追加中...');
    const { data: todoData, error: todoError } = await supabase
      .from('todos')
      .insert([
        {
          title: 'Expo MCP Test',
          description: 'シミュレーターでの実機テストで追加されたTODO',
          completed: false,
          priority: 'high',
          category: 'work',
          user_id: authData.user?.id,
        },
      ])
      .select()
      .single();

    if (todoError) {
      console.error('❌ TODO追加エラー:', todoError.message);
      throw todoError;
    }

    console.log('✅ TODO追加成功!');
    console.log('📋 追加されたTODO:', JSON.stringify(todoData, null, 2));

    // 追加されたTODOを確認
    const { data: fetchedTodo, error: fetchError } = await supabase
      .from('todos')
      .select('*')
      .eq('id', todoData.id)
      .single();

    if (fetchError) {
      console.error('❌ TODO取得エラー:', fetchError.message);
    } else {
      console.log('✅ TODO取得成功:', fetchedTodo?.title);
    }

    console.log('\n🎉 テスト完了! シミュレーターのアプリで「Expo MCP Test」が表示されることを確認してください。');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

testAddTodo();

