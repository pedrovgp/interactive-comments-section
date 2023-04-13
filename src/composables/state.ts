import { computed, reactive, readonly } from 'vue'
import type { ComputedRef } from 'vue'
import { ACTION_TYPE } from '../constants/ACTION_TYPE'
import type { IComment } from '../interfaces/IComment'
import type { IUser } from '../interfaces/IUser'
import { createApi } from '../../../../services/fam/fam'

const CommentApi = createApi('comment')
const CurrentUserApi = createApi('user_current')

const state = reactive({
  actionType: null as string | null,
  activeId: null as number | null,
  comments: [] as IComment[],
  currentUser: {} as IUser,
  isModalActive: false,
  backendComments: [],
})

function mapInterfacesBackToFront(comments: any[]): IComment[] {
  const mappedComments = comments.map((comment: any): IComment => {
    return {
      id: comment.id,
      parentId: comment.parent_id,
      content: comment.content,
      createdAt: comment.created_at,
      score: comment.score,
      user: comment.owner,
      status: comment.status,
    }
  })
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
      status: comment.status,
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

  CurrentUserApi.getAll({})
    .then((response) => {
      state.currentUser = response.data[0]
      console.log(`Current user: ${state.currentUser.username}`)
    })
    .catch((error) => {
      state.currentUser = {}
      console.log(error)
    })
}

function findReplies(id: number | null) {
  const parentIds: number[] = []
  const filteredComments: IComment[] = state.comments.filter((comment: IComment) => {
    return comment.parentId === id
  })
  if (filteredComments.length && id) {
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
// Keep the below in sync with the backend config
export const STATUS_CHOICES = {
  NEW: 0,
  REPLIED: 1,
  ARCHIVED: 2,
}
export function useState() {
  const isDataLoaded: ComputedRef<boolean> = computed((): boolean => {
    return Object.keys(state.currentUser).length > 0
  })

  function addComment(content: string, parentId: number | null = null): void {
    const comment: IComment = {
      id: null,
      parentId,
      content,
      createdAt: null,
      score: 0,
      status: null,
      user: { ...state.currentUser },
    }
    console.log('Creating comment')
    const newComment = mapInterfacesFrontToBack([comment])[0]
    console.log(newComment)
    CommentApi.create(newComment)
      .then((response) => {
        console.log('Created comment')
        state.comments.unshift(mapInterfacesBackToFront([response.data])[0])
        console.log(mapInterfacesBackToFront([response.data])[0])
      })
      .catch((error) => {
        console.log('addComment failed')
        console.log(error)
      })
  }

  function changeScore(id: number, amount: number): void {
    const comment: IComment = state.comments.find((comment: IComment): boolean => comment.id === id)!
    const newScore: number = comment.score + amount
    CommentApi.update({ id: id.toString(), data: { score: newScore } })
      .then((response) => {
        comment.score = newScore >= 0 ? newScore : 0
      })
      .catch((error) => {
        console.log(error)
      })
  }

  function deleteComment(id: number): void {
    const parentIds: Set<number> = new Set(findReplies(id))
    CommentApi.delete(id)
      .then((response) => {
        state.comments = state.comments.filter((comment: IComment): boolean => {
          return comment.id !== id && !parentIds.has(comment.parentId as number)
        })
      })
      .catch((error) => {
        console.log(error)
      })
  }

  function changeStatus(id: number, newStatus: number): void {
    const parentIds: Set<number> = new Set(findReplies(id))
    CommentApi.update({ id: id.toString(), data: { status: newStatus } })
      .then((response) => {
        state.comments = state.comments.filter((comment: IComment): boolean => {
          return comment.id !== id && !parentIds.has(comment.parentId as number)
        })
      })
      .catch((error) => {
        console.log(error)
      })
  }

  async function loadData(): Promise<void> {
    // When App starts, load data from from the backend to state
    await fetchData({ status: STATUS_CHOICES.NEW })
  }

  function hasReplies(id: number): boolean {
    return state.comments.some((comment: IComment): boolean => comment.parentId === id)
  }

  function replies(id: number): IComment[] {
    return state.comments.filter((comment: IComment): boolean => comment?.parentId === id)
  }

  function saveData() {
    // const data: IData = {
    //   currentUser: state.currentUser,
    //   comments: state.comments,
    // }
    // localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  function setActive(id: number | null, activityType: string | null) {
    state.activeId = id
    state.actionType = activityType
  }

  function toggleModal(isActive: boolean) {
    state.isModalActive = isActive
  }

  function updateComment(content: string, id: number) {
    CommentApi.update({ id: id.toString(), data: { content: content } })
      .then((response) => {
        state.comments = state.comments.map((comment: IComment): IComment => {
          if (comment.id === id) {
            comment.content = content
          }
          return comment
        })
        saveData()
      })
      .catch((error) => {
        console.log(error)
      })
  }

  return {
    state: readonly(state),
    isDataLoaded,

    addComment,
    changeScore,
    deleteComment,
    changeStatus,
    loadData,
    hasReplies,
    replies,
    saveData,
    setActive,
    toggleModal,
    updateComment,
  }
}
