import { useState, useCallback } from 'react';
import {
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { View, Text } from '@/components/Themed';
import { useLists } from '@/contexts/ListsContext';
import { useRouter } from 'expo-router';

const EMOJIS = ['🛒', '📋', '❤️', '⭐', '🏠', '📦', '🎯', '💡', '🔥', '🍽️', '🥗', '🧃'];

function formatDate(iso: string): string {
  const d = new Date(iso);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  if (d.getFullYear() !== new Date().getFullYear()) {
    opts.year = 'numeric';
  }
  return d.toLocaleDateString(undefined, opts);
}

export default function ListsScreen() {
  const { lists, createList, deleteList } = useLists();
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🛒');

  const handleCreate = useCallback(() => {
    const name = newName.trim();
    if (!name) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    createList(name, newEmoji);
    setNewName('');
    setNewEmoji('🛒');
    setShowCreate(false);
  }, [newName, newEmoji, createList]);

  const handleDelete = useCallback(
    (listId: string, listName: string) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert(
        'Delete List',
        `Remove "${listName}"? This can't be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteList(listId),
          },
        ],
      );
    },
    [deleteList],
  );

  const itemCountText = (count: number) =>
    count === 0 ? 'No items' : `${count} item${count > 1 ? 's' : ''}`;

  return (
    <View style={styles.root} lightColor="#0f172a" darkColor="#0f172a">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          lists.length === 0 ? styles.scrollContentEmpty : styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
      >
        {lists.length === 0 ? (
          <View style={styles.emptyState} lightColor="transparent" darkColor="transparent">
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No Saved Lists</Text>
            <Text style={styles.emptySubtitle}>
              Create your first shopping list to get started.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.createFirstButton,
                pressed && styles.createFirstButtonPressed,
              ]}
              onPress={() => setShowCreate(true)}
            >
              <FontAwesome name="plus" size={14} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.createFirstButtonText}>Create your first list</Text>
            </Pressable>
          </View>
        ) : (
          lists.map((list) => (
            <Pressable
              key={list.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/lists/${list.id}`);
              }}
            >
              <View style={styles.cardRow} lightColor="transparent" darkColor="transparent">
                <Text style={styles.cardEmoji}>{list.emoji}</Text>
                <View style={styles.cardInfo} lightColor="transparent" darkColor="transparent">
                  <Text style={styles.cardName} numberOfLines={1}>
                    {list.name}
                  </Text>
                  <Text style={styles.cardMeta}>
                    {itemCountText(list.items.length)} · Updated {formatDate(list.updatedAt)}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleDelete(list.id, list.name)}
                  style={styles.cardDelete}
                  hitSlop={8}
                >
                  <FontAwesome name="trash-o" size={16} color="#64748b" />
                </Pressable>
              </View>
              {list.isRecurring && (
                <View style={styles.recurringTag} lightColor="#1e40af" darkColor="#1e40af">
                  <FontAwesome name="repeat" size={9} color="#93c5fd" style={{ marginRight: 4 }} />
                  <Text style={styles.recurringTagText}>Recurring</Text>
                </View>
              )}
            </Pressable>
          ))
        )}
      </ScrollView>

      {lists.length > 0 && (
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowCreate(true);
          }}
        >
          <FontAwesome name="plus" size={20} color="#fff" />
        </Pressable>
      )}

      <Modal
        visible={showCreate}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreate(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowCreate(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.kbav}
          >
            <Pressable style={styles.modalContent} onPress={() => {}}>
              <Text style={styles.modalTitle}>New List</Text>

              <Text style={styles.modalLabel}>Emoji</Text>
              <View style={styles.emojiRow} lightColor="transparent" darkColor="transparent">
                {EMOJIS.map((e) => (
                  <Pressable
                    key={e}
                    onPress={() => setNewEmoji(e)}
                    style={[styles.emojiOption, e === newEmoji && styles.emojiSelected]}
                  >
                    <Text style={styles.emojiOptionText}>{e}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.modalLabel}>List Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Weekly Groceries"
                placeholderTextColor="#64748b"
                value={newName}
                onChangeText={setNewName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreate}
              />

              <View style={styles.modalActions} lightColor="transparent" darkColor="transparent">
                <Pressable
                  style={({ pressed }) => [
                    styles.cancelButton,
                    pressed && styles.cancelButtonPressed,
                  ]}
                  onPress={() => {
                    setNewName('');
                    setShowCreate(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.createButton,
                    pressed && styles.createButtonPressed,
                  ]}
                  onPress={handleCreate}
                >
                  <Text style={styles.createButtonText}>Create List</Text>
                </Pressable>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 100,
  },
  scrollContentEmpty: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createFirstButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  createFirstButtonPressed: {
    backgroundColor: '#2563eb',
  },
  createFirstButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardPressed: {
    opacity: 0.8,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 32,
    marginRight: 14,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  cardMeta: {
    color: '#94a3b8',
    fontSize: 13,
  },
  cardDelete: {
    padding: 8,
    marginLeft: 8,
  },
  recurringTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  recurringTagText: {
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabPressed: {
    backgroundColor: '#2563eb',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  kbav: {
    width: '100%',
    maxWidth: 380,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    color: '#f1f5f9',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 12,
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiOption: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emojiSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#1e3a5f',
  },
  emojiOptionText: {
    fontSize: 20,
  },
  modalInput: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f1f5f9',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cancelButtonPressed: {
    backgroundColor: '#334155',
  },
  cancelButtonText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#3b82f6',
  },
  createButtonPressed: {
    backgroundColor: '#2563eb',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
