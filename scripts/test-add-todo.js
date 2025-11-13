/**
 * シミュレーターでの実機テスト用スクリプト
 * 「Expo MCP Test」というTODOをSupabaseに追加します
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  console.error('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? '設定済み' : '未設定');
  console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '設定済み' : '未設定');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAddTodo() {
  try {
    console.log('🔐 ログイン中...');
    console.log('📧 メールアドレス: keitanamazue@gmail.com');
    
    // ログイン
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'keitanamazue@gmail.com',
      password: 'Test1234',
    });

    if (authError) {
      console.error('❌ ログインエラー:', authError.message);
      throw authError;
    }

    console.log('✅ ログイン成功!');
    console.log('👤 ユーザー:', authData.user?.email);
    console.log('🆔 ユーザーID:', authData.user?.id);

    // TODOを追加
    console.log('\n📝 TODOを追加中...');
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
      console.error('詳細:', todoError);
      throw todoError;
    }

    console.log('✅ TODO追加成功!');
    console.log('📋 追加されたTODO:');
    console.log('   - ID:', todoData.id);
    console.log('   - タイトル:', todoData.title);
    console.log('   - 説明:', todoData.description);
    console.log('   - 優先度:', todoData.priority);
    console.log('   - カテゴリ:', todoData.category);
    console.log('   - 完了状態:', todoData.completed ? '完了' : '未完了');

    // 追加されたTODOを確認
    console.log('\n🔍 追加されたTODOを確認中...');
    const { data: fetchedTodo, error: fetchError } = await supabase
      .from('todos')
      .select('*')
      .eq('id', todoData.id)
      .single();

    if (fetchError) {
      console.error('❌ TODO取得エラー:', fetchError.message);
    } else {
      console.log('✅ TODO取得成功!');
      console.log('📋 取得したTODO:', fetchedTodo?.title);
    }

    console.log('\n🎉 テスト完了!');
    console.log('📱 シミュレーターのアプリで「Expo MCP Test」が表示されることを確認してください。');
    console.log('💡 アプリをリフレッシュ（プルダウン）すると、新しいTODOが表示されます。');

  } catch (error) {
    console.error('\n❌ エラーが発生しました:');
    console.error(error);
    process.exit(1);
  }
}

testAddTodo();

