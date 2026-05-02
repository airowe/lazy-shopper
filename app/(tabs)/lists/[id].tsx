import { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { View, Text } from '@/components/Themed';
import { useLists } from '@/contexts/ListsContext';
import { useBasket } from '@/contexts/BasketContext';
import { useLocalSearchParams, useRouter } from 'expo-router';

const EMOJIS = ['🛒', '📋', '❤️', '⭐', '🏠', '📦', '🎯', '💡', '🔥', '🍽️', '🥗', '🧃'];

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getList, updateItemQuantity, removeItemFromList, updateList, deleteList } =
    useLists();
  const { addItem } = useBasket();
  const router = useRouter();

  const list = useMemo(() => (id ? getList(id) : undefined), [id, getList]);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmoji, setEditEmoji] = useState('🛒');
  const [editRecurring, setEditRecurring] = useState(false);

  const startEdit = useCallback(() => {
    if (!list) return;
    setEditName(list.name);
    setEditEmoji(list.emoji);
    setEditRecurring(list.isRecurring);
    setIsEditing(true);
  }, [list]);

  const saveEdit = useCallback(() => {
    if (!list) return;
    const name = editName.trim();
    if (!name) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateList(list.id, { name, emoji: editEmoji, isRecurring: editRecurring });
    setIsEditing(false);
  }, [list, editName, editEmoji, editRecurring, updateList]);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const adjustQuantity = useCallback(
    (productId: string, delta: number) => {
      if (!list) return;
      const item = list.items.find((i) => i.productId === productId);
      if (!item) return;
      const newQty = item.quantity + delta;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (newQty <= 0) {
        removeItemFromList(list.id, productId);
      } else {
        updateItemQuantity(list.id, productId, newQty);
      }
    },
    [list, removeItemFromList, updateItemQuantity],
  );

  const handleRemoveItem = useCallback(
    (productId: string, itemName: string) => {
      if (!list) return;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert(
        'Remove Item',
        `Remove "${itemName}" from this list?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => removeItemFromList(list.id, productId),
          },
        ],
      );
    },
    [list, removeItemFromList],
  );

  const handleCompareAll = useCallback(() => {
    if (!list || list.items.length === 0) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Empty List', 'Add some items to your list first.');
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    for (const item of list.items) {
      addItem({
        productId: item.productId,
        name: item.name,
        image: item.image,
        quantity: item.quantity,
      });
    }
    router.push('/basket');
  }, [list, addItem, router]);

  const handleDeleteList = useCallback(() => {
    if (!list) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete List',
      `Permanently delete "${list.name}"? This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteList(list.id);
            router.back();
          },
        },
      ],
    );
  }, [list, deleteList, router]);

  if (!id) {
    return (
      <View style={styles.root} lightColor="#0f172a" darkColor="#0f172a">
        <View style={styles.emptyState} lightColor="transparent" darkColor="transparent">
          <Text style={styles.emptyEmoji}>❓</Text>
          <Text style={styles.emptyTitle}>Missing List ID</Text>
          <Text style={styles.emptySubtitle}>
            No list identifier was provided. Please go back and try again.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.actionButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!list) {
    return (
      <View style={styles.root} lightColor="#0f172a" darkColor="#0f172a">
        <View style={styles.emptyState} lightColor="transparent" darkColor="transparent">
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>List Not Found</Text>
          <Text style={styles.emptySubtitle}>
            This list may have been deleted or doesn't exist.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.actionButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const totalQty = list.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <View style={styles.root} lightColor="#0f172a" darkColor="#0f172a">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Header Card --- */}
        <View style={styles.headerCard} lightColor="#1e293b" darkColor="#1e293b">
          <View style={styles.headerTop} lightColor="transparent" darkColor="transparent">
            <Text style={styles.headerEmoji}>{list.emoji}</Text>
            {isEditing ? (
              <View style={styles.editRow} lightColor="transparent" darkColor="transparent">
                <Pressable onPress={cancelEdit} style={styles.editCancelBtn} hitSlop={8}>
                  <FontAwesome name="times" size={16} color="#94a3b8" />
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.saveBtn,
                    pressed && styles.saveBtnPressed,
                  ]}
                  onPress={saveEdit}
                >
                  <Text style={styles.saveBtnText}>Save</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={startEdit} style={styles.editBtn} hitSlop={8}>
                <FontAwesome name="pencil" size={14} color="#64748b" />
              </Pressable>
            )}
          </View>

          {isEditing ? (
            <>
              <Text style={styles.editLabel}>Emoji</Text>
              <View style={styles.emojiRow} lightColor="transparent" darkColor="transparent">
                {EMOJIS.map((e) => (
                  <Pressable
                    key={e}
                    onPress={() => setEditEmoji(e)}
                    style={[styles.emojiOption, e === editEmoji && styles.emojiSelected]}
                  >
                    <Text style={styles.emojiOptionText}>{e}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.editLabel}>Name</Text>
              <TextInput
                style={styles.editInput}
                value={editName}
                onChangeText={setEditName}
                placeholderTextColor="#64748b"
                returnKeyType="done"
                onSubmitEditing={saveEdit}
                autoFocus
              />

              <Pressable
                style={styles.recurringToggle}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setEditRecurring((prev) => !prev);
                }}
              >
                <View
                  style={[styles.checkbox, editRecurring && styles.checkboxChecked]}
                  lightColor={editRecurring ? '#3b82f6' : '#334155'}
                  darkColor={editRecurring ? '#3b82f6' : '#334155'}
                >
                  {editRecurring && <FontAwesome name="check" size={10} color="#fff" />}
                </View>
                <Text style={styles.recurringLabel}>Recurring list</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.headerTitle}>{list.name}</Text>
              <View style={styles.headerMeta} lightColor="transparent" darkColor="transparent">
                <Text style={styles.headerMetaText}>
                  {list.items.length === 0
                    ? 'No items'
                    : `${list.items.length} item${list.items.length > 1 ? 's' : ''} · ${totalQty} total`}
                </Text>
                {list.isRecurring && (
                  <View style={styles.recurringBadge} lightColor="#1e40af" darkColor="#1e40af">
                    <FontAwesome
                      name="repeat"
                      size={10}
                      color="#93c5fd"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.recurringBadgeText}>Recurring</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>

        {/* --- Items Section --- */}
        <View style={styles.section} lightColor="transparent" darkColor="transparent">
          <Text style={styles.sectionTitle}>Items</Text>

          {list.items.length === 0 ? (
            <View style={styles.emptyItems} lightColor="transparent" darkColor="transparent">
              <Text style={styles.emptyItemsEmoji}>📭</Text>
              <Text style={styles.emptyItemsText}>No items yet</Text>
              <Text style={styles.emptyItemsSubtext}>
                Tap "Add Items" to start building your list.
              </Text>
            </View>
          ) : (
            list.items.map((item) => (
              <View key={item.productId} style={styles.itemCard} lightColor="#1e293b" darkColor="#1e293b">
                <View style={styles.itemMain} lightColor="transparent" darkColor="transparent">
                  <Text style={styles.itemEmoji}>{item.image}</Text>
                  <View style={styles.itemInfo} lightColor="transparent" darkColor="transparent">
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.note ? <Text style={styles.itemNote}>{item.note}</Text> : null}
                  </View>
                </View>
                <View style={styles.itemActions} lightColor="transparent" darkColor="transparent">
                  <Pressable
                    style={({ pressed }) => [
                      styles.qtyBtn,
                      pressed && styles.qtyBtnPressed,
                    ]}
                    onPress={() => adjustQuantity(item.productId, -1)}
                  >
                    <FontAwesome name="minus" size={12} color="#f1f5f9" />
                  </Pressable>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                  <Pressable
                    style={({ pressed }) => [
                      styles.qtyBtn,
                      pressed && styles.qtyBtnPressed,
                    ]}
                    onPress={() => adjustQuantity(item.productId, 1)}
                  >
                    <FontAwesome name="plus" size={12} color="#f1f5f9" />
                  </Pressable>
                  <Pressable
                    onPress={() => handleRemoveItem(item.productId, item.name)}
                    style={styles.itemDeleteBtn}
                    hitSlop={8}
                  >
                    <FontAwesome name="trash-o" size={14} color="#ef4444" />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>

        {/* --- Actions --- */}
        <View style={styles.actionsSection} lightColor="transparent" darkColor="transparent">
          <Pressable
            style={({ pressed }) => [
              styles.compareAllBtn,
              pressed && styles.compareAllBtnPressed,
            ]}
            onPress={handleCompareAll}
          >
            <FontAwesome name="balance-scale" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.compareAllBtnText}>
              Compare All ({totalQty} item{totalQty !== 1 ? 's' : ''})
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.addItemsBtn,
              pressed && styles.addItemsBtnPressed,
            ]}
            onPress={() => router.push('/')}
          >
            <FontAwesome name="search" size={14} color="#3b82f6" style={{ marginRight: 8 }} />
            <Text style={styles.addItemsBtnText}>Add Items</Text>
          </Pressable>
        </View>

        {/* --- Delete List --- */}
        <Pressable
          style={({ pressed }) => [
            styles.deleteListBtn,
            pressed && styles.deleteListBtnPressed,
          ]}
          onPress={handleDeleteList}
        >
          <FontAwesome name="trash-o" size={14} color="#ef4444" style={{ marginRight: 8 }} />
          <Text style={styles.deleteListBtnText}>Delete List</Text>
        </Pressable>

        <View style={styles.spacer} lightColor="transparent" darkColor="transparent" />
      </ScrollView>
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
    paddingBottom: 60,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
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
  actionButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  actionButtonPressed: {
    backgroundColor: '#2563eb',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  headerCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerEmoji: {
    fontSize: 40,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    padding: 8,
  },
  editCancelBtn: {
    padding: 8,
  },
  saveBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveBtnPressed: {
    backgroundColor: '#2563eb',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  editLabel: {
    color: '#94a3b8',
    fontSize: 11,
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
    width: 36,
    height: 36,
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
    fontSize: 18,
  },
  editInput: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f1f5f9',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  recurringToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: '#3b82f6',
  },
  recurringLabel: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  headerTitle: {
    color: '#f1f5f9',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 6,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  headerMetaText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recurringBadgeText: {
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  emptyItems: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyItemsEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyItemsText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyItemsSubtext: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  itemCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  itemMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '600',
  },
  itemNote: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnPressed: {
    backgroundColor: '#475569',
  },
  qtyValue: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '700',
    minWidth: 36,
    textAlign: 'center',
  },
  itemDeleteBtn: {
    padding: 8,
    marginLeft: 'auto',
  },
  actionsSection: {
    gap: 10,
    marginBottom: 24,
  },
  compareAllBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  compareAllBtnPressed: {
    backgroundColor: '#2563eb',
  },
  compareAllBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  addItemsBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#334155',
  },
  addItemsBtnPressed: {
    backgroundColor: '#1e293b',
  },
  addItemsBtnText: {
    color: '#3b82f6',
    fontSize: 15,
    fontWeight: '600',
  },
  deleteListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#451a1a',
  },
  deleteListBtnPressed: {
    backgroundColor: '#451a1a',
  },
  deleteListBtnText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  spacer: {
    height: 40,
  },
});
