import { computed, reactive, readonly } from 'vue'
import type { ComputedRef } from 'vue'
import { ACTION_TYPE } from '../constants/ACTION_TYPE'
import type { IComment } from '../interfaces/IComment'
import type { IData } from '../interfaces/IData'
import type { IUser } from '../interfaces/IUser'
import createApi from '../../../../services/fam/fam'

const STORAGE_KEY = 'interactive-comments-section-main' as const
const CommentApi = createApi('comment')

const state = reactive({
  actionType: null as string | null,
  activeId: null as number | null,
  comments: [] as IComment[],
  currentUser: {} as IUser,
  isModalActive: false,
})

function getUserId(user: IUser): number {
  return 4
}

function mapInterfacesBackToFront(comments: any[]): IComment[] {
  console.log('comments in map')
  console.log(comments)
  const mappedComments = comments.map((comment: any): IComment => {
    return {
      id: comment.id,
      parentId: comment.parent_id,
      content: comment.content,
      createdAt: comment.created_at,
      score: comment.score,
      user: comment.owner,
    }
  })
  console.log('mappedComments')
  console.log(mappedComments)
  return mappedComments
}

function mapInterfacesFrontToBack(comments: IComment[]): any[] {
  return comments.map((comment: IComment): any => {
    return {
      id: comment.id,
      parent_id: comment.parentId,
      content: comment.content,
      created_at: null,
      score: comment.score,
      owner: null,
    }
  })
}

async function fetchData(params: any) {
  CommentApi.getAll(params)
    .then((response) => {
      state.comments = mapInterfacesBackToFront(response.data)
    })
    .catch((error) => {
      state.comments = []
      console.log(error)
    })

  console.log('state.comments')
  console.log(state.comments)

  const alteredData = {
    currentUser: {
      image: {},
      username: 'pv',
    },
    comments: state.comments,
  }
  console.log('alteredData')
  console.log(alteredData)
  return alteredData
}

function findReplies(id: number) {
  const parentIds: number[] = []
  const filteredComments: IComment[] = state.comments.filter((comment: IComment) => {
    return comment.parentId === id
  })
  if (filteredComments.length) {
    parentIds.push(id)
    filteredComments.forEach((comment: IComment): void => {
      parentIds.concat(findReplies(comment.id))
    })
  }
  return parentIds
}

export const DELETING = ACTION_TYPE.DELETING
export const EDITTING = ACTION_TYPE.EDITTING
export const REPLYING = ACTION_TYPE.REPLYING
export function useState() {
  const isDataLoaded: ComputedRef<boolean> = computed((): boolean => {
    return true //state.comments.length > 0
  })

  function addComment(content: string, parentId: number | null = null): void {
    const comment: IComment = {
      id: null,
      parentId,
      content,
      createdAt: null,
      score: 0,
      user: { ...state.currentUser },
    }
    console.log('Creating comment')
    console.log(mapInterfacesFrontToBack([comment])[0])
    CommentApi.create(mapInterfacesFrontToBack([comment])[0]).catch((error) => {
      console.log(error)
    })
    loadData()
  }

  function changeScore(id: number, amount: number): void {
    const comment: IComment = state.comments.find((comment: IComment): boolean => comment.id === id)!
    const newScore: number = comment.score + amount
    comment.score = newScore >= 0 ? newScore : 0
    CommentApi.update({ id: comment.id.toString(), data: { score: newScore } }).catch((error) => {
      console.log(error)
    })
    loadData()
  }

  function deleteComment(id: number): void {
    const parentIds: Set<number> = new Set(findReplies(id))
    state.comments = state.comments.filter((comment: IComment): boolean => {
      return comment.id !== id && !parentIds.has(comment.parentId as number)
    })
    CommentApi.delete(id).catch((error) => {
      console.log(error)
    })
    loadData()
  }

  async function loadData(): Promise<void> {
    const data: IData | undefined = await fetchData({})
    state.currentUser = data.currentUser
    console.log('Loading data')
    console.log(data)
    state.comments = data.comments
  }

  function hasReplies(id: number): boolean {
    return state.comments.some((comment: IComment): boolean => comment.parentId === id)
  }

  function replies(id: number): IComment[] {
    return state.comments.filter((comment: IComment): boolean => comment?.parentId === id)
  }

  function setActive(id: number | null, activityType: string | null) {
    state.activeId = id
    state.actionType = activityType
  }

  function toggleModal(isActive: boolean) {
    state.isModalActive = isActive
  }

  function updateComment(content: string, id: number) {
    state.comments = state.comments.map((comment: IComment): IComment => {
      if (comment.id === id) {
        comment.content = content
      }
      return comment
    })
    CommentApi.update({ id: id.toString(), data: { content: content } }).catch((error) => {
      console.log(error)
    })
    loadData
  }

  return {
    state: readonly(state),
    isDataLoaded,

    addComment,
    changeScore,
    deleteComment,
    loadData,
    hasReplies,
    replies,
    setActive,
    toggleModal,
    updateComment,
  }
}
