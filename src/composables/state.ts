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
  backendComments: [],
})

function getUserId(user: IUser): number {
  return 4
}

function mapInterfacesBackToFront(comments: any[]): IComment[] {
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
      state.backendComments = mapInterfacesBackToFront(response.data)
      state.comments = mapInterfacesBackToFront(response.data)
    })
    .catch((error) => {
      state.backendComments = []
      console.log(error)
    })
  console.log('Fetching data, before altered data:')
  console.log(state)

  const alteredData = {
    currentUser: {
      image: {},
      username: 'pv',
    },
    comments: state.comments,
  }
  console.log('Fetching data, altered data:')
  console.log(state)
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
    return Object.keys(state.currentUser).length > 0
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
    CommentApi.create(mapInterfacesFrontToBack([comment])[0])
      .then((response) => {
        state.comments.unshift(mapInterfacesBackToFront([response.data])[0])
        saveData()
      })
      .catch((error) => {
        console.log(error)
      })
  }

  function changeScore(id: number, amount: number): void {
    const comment: IComment = state.comments.find((comment: IComment): boolean => comment.id === id)!
    const newScore: number = comment.score + amount
    CommentApi.update({ id: comment.id.toString(), data: { score: newScore } })
      .then((response) => {
        comment.score = newScore >= 0 ? newScore : 0
        saveData()
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
        saveData()
      })
      .catch((error) => {
        console.log(error)
      })
  }

  async function loadData(): Promise<void> {
    // When App starts, load data from from the backend to
    const data: IData | undefined = await fetchData({})
    console.log('Data loaded')
    state.currentUser = data.currentUser
    state.comments = data.comments
    console.log(state)
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
    loadData,
    hasReplies,
    replies,
    saveData,
    setActive,
    toggleModal,
    updateComment,
  }
}
